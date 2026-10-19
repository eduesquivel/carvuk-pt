import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCLP, formatDate } from "@/lib/format";
import { calculateTotals } from "@/lib/receipts/tax";
import { createClient } from "@/lib/supabase/server";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) notFound();

  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("id, name, unit_price, created_at")
    .eq("id", productId)
    .maybeSingle();

  if (!product || product.name == null || product.unit_price == null) notFound();

  const { tax, net } = calculateTotals(product.unit_price);

  return (
    <div className="flex flex-col gap-6">
      <Link href="/products" className="text-sm text-muted-foreground hover:underline">
        ← Volver al catálogo
      </Link>
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">{product.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-y-1 text-sm">
            <dt className="text-muted-foreground">Precio (bruto)</dt>
            <dd className="text-right font-semibold">{formatCLP(product.unit_price)}</dd>
            <dt className="text-muted-foreground">Valor neto</dt>
            <dd className="text-right">{formatCLP(net)}</dd>
            <dt className="text-muted-foreground">Impuesto</dt>
            <dd className="text-right">{formatCLP(tax)}</dd>
            <dt className="text-muted-foreground">Código</dt>
            <dd className="text-right">#{product.id}</dd>
            <dt className="text-muted-foreground">Creado</dt>
            <dd className="text-right">{formatDate(product.created_at)}</dd>
          </dl>
        </CardContent>
        <CardFooter>
          <AddToCartButton
            productId={product.id}
            name={product.name}
            unitPrice={product.unit_price}
          />
        </CardFooter>
      </Card>
    </div>
  );
}
