"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/components/cart/cart-provider";
import { formatCLP } from "@/lib/format";
import { TAX_RATE } from "@/lib/receipts/tax";
import { createReceipt } from "./actions";

export function CartView() {
  const { items, totals, setQuantity, removeItem, clear } = useCart();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="text-muted-foreground">Tu carrito está vacío.</p>
        <Button asChild>
          <Link href="/products">Ir al catálogo</Link>
        </Button>
      </div>
    );
  }

  function handleGenerate() {
    setError(null);
    startTransition(async () => {
      const result = await createReceipt(
        items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      );
      if (!result.ok) {
        setError(result.error);
        return;
      }
      clear();
      router.push(`/receipts/${result.receiptId}`);
    });
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_320px]">
      <ul className="divide-y rounded-xl border">
        {items.map((item) => (
          <li key={item.productId} className="flex items-center gap-4 p-4">
            <div className="flex-1">
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatCLP(item.unitPrice)} c/u
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                aria-label="Quitar uno"
                onClick={() => setQuantity(item.productId, item.quantity - 1)}
              >
                <Minus />
              </Button>
              <span className="w-8 text-center tabular-nums">{item.quantity}</span>
              <Button
                size="icon"
                variant="outline"
                aria-label="Agregar uno"
                onClick={() => setQuantity(item.productId, item.quantity + 1)}
              >
                <Plus />
              </Button>
            </div>
            <p className="w-24 text-right font-medium tabular-nums">
              {formatCLP(item.unitPrice * item.quantity)}
            </p>
            <Button
              size="icon"
              variant="ghost"
              aria-label={`Eliminar ${item.name}`}
              onClick={() => removeItem(item.productId)}
            >
              <Trash2 />
            </Button>
          </li>
        ))}
      </ul>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Resumen</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <dl className="grid grid-cols-2 gap-y-1 text-sm">
            <dt className="text-muted-foreground">Valor neto</dt>
            <dd className="text-right tabular-nums">{formatCLP(totals.net)}</dd>
            <dt className="text-muted-foreground">
              Impuesto ({TAX_RATE * 100}%)
            </dt>
            <dd className="text-right tabular-nums">{formatCLP(totals.tax)}</dd>
            <dt className="font-semibold">Total</dt>
            <dd className="text-right font-semibold tabular-nums">
              {formatCLP(totals.gross)}
            </dd>
          </dl>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={handleGenerate} disabled={isPending}>
            {isPending ? "Generando..." : "Generar boleta"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
