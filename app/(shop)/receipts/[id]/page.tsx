import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCLP, formatDate } from "@/lib/format";
import { TAX_RATE } from "@/lib/receipts/tax";
import { createClient } from "@/lib/supabase/server";

export default async function ReceiptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const receiptId = Number(id);
  if (!Number.isInteger(receiptId)) notFound();

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims.sub;

  let query = supabase
    .from("receipt")
    .select(
      "id, created_at, gross_value, tax, net_value, carts(id, quantity, products(id, name, unit_price))",
    )
    .eq("id", receiptId);
  if (userId) query = query.eq("user_id", userId);

  const { data: receipt } = await query.maybeSingle();
  if (!receipt) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Link href="/receipts" className="text-sm text-muted-foreground hover:underline">
        ← Volver al historial
      </Link>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Boleta #{receipt.id}</CardTitle>
          <p className="text-sm text-muted-foreground">{formatDate(receipt.created_at)}</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <table className="w-full text-sm">
            <thead className="border-b text-left text-muted-foreground">
              <tr>
                <th className="py-2">Producto</th>
                <th className="text-right">Cantidad</th>
                <th className="text-right">Precio unitario</th>
                <th className="text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {receipt.carts.map((line) => {
                const unitPrice = line.products?.unit_price ?? 0;
                const quantity = line.quantity ?? 0;
                return (
                  <tr key={line.id}>
                    <td className="py-2">{line.products?.name ?? "Producto eliminado"}</td>
                    <td className="text-right tabular-nums">{quantity}</td>
                    <td className="text-right tabular-nums">{formatCLP(unitPrice)}</td>
                    <td className="text-right tabular-nums">
                      {formatCLP(unitPrice * quantity)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <dl className="ml-auto grid w-64 grid-cols-2 gap-y-1 text-sm">
            <dt className="text-muted-foreground">Valor neto</dt>
            <dd className="text-right tabular-nums">{formatCLP(receipt.net_value ?? 0)}</dd>
            <dt className="text-muted-foreground">Impuesto ({TAX_RATE * 100}%)</dt>
            <dd className="text-right tabular-nums">{formatCLP(receipt.tax ?? 0)}</dd>
            <dt className="font-semibold">Total</dt>
            <dd className="text-right font-semibold tabular-nums">
              {formatCLP(receipt.gross_value ?? 0)}
            </dd>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
