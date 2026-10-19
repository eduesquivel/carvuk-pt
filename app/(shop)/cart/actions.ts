"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { calculateGross, calculateTotals } from "@/lib/receipts/tax";

const itemsSchema = z
  .array(
    z.object({
      productId: z.number().int().positive(),
      quantity: z.number().int().positive().max(999),
    }),
  )
  .min(1, "El carrito está vacío");

export type CreateReceiptResult =
  | { ok: true; receiptId: number }
  | { ok: false; error: string };

export async function createReceipt(input: unknown): Promise<CreateReceiptResult> {
  const parsed = itemsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Carrito inválido" };
  }

  // Agrupa productos repetidos en una sola línea.
  const quantities = new Map<number, number>();
  for (const { productId, quantity } of parsed.data) {
    quantities.set(productId, (quantities.get(productId) ?? 0) + quantity);
  }
  const productIds = [...quantities.keys()];

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims.sub ?? null;

  // Los precios se leen desde la base; nunca se confía en los del cliente.
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, unit_price")
    .in("id", productIds);

  if (productsError) {
    return { ok: false, error: "No se pudieron obtener los productos" };
  }

  const priceById = new Map(products.map((p) => [p.id, p.unit_price]));
  const lines = productIds.map((productId) => ({
    productId,
    quantity: quantities.get(productId)!,
    unitPrice: priceById.get(productId),
  }));

  if (lines.some((l) => l.unitPrice == null)) {
    return { ok: false, error: "Uno o más productos ya no están disponibles" };
  }

  const { gross, tax, net } = calculateTotals(
    calculateGross(lines as { unitPrice: number; quantity: number }[]),
  );

  const { data: receipt, error: receiptError } = await supabase
    .from("receipt")
    .insert({ gross_value: gross, tax, net_value: net, user_id: userId })
    .select("id")
    .single();

  if (receiptError) {
    return { ok: false, error: "No se pudo generar la boleta" };
  }

  const { error: itemsError } = await supabase.from("carts").insert(
    lines.map((l) => ({
      receipt_id: receipt.id,
      product_id: l.productId,
      quantity: l.quantity,
    })),
  );

  if (itemsError) {
    // Compensación: sin transacción entre ambos inserts, se elimina la
    // cabecera para no dejar una boleta sin productos.
    await supabase.from("carts").delete().eq("receipt_id", receipt.id);
    await supabase.from("receipt").delete().eq("id", receipt.id);
    return { ok: false, error: "No se pudo generar la boleta" };
  }

  revalidatePath("/receipts");
  return { ok: true, receiptId: receipt.id };
}
