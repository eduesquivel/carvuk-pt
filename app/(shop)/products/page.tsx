import Link from "next/link";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCLP } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, unit_price")
    .not("name", "is", null)
    .not("unit_price", "is", null)
    .order("name");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Catálogo</h1>
      {error && <p className="text-destructive">No se pudo cargar el catálogo.</p>}
      {products?.length === 0 && (
        <p className="text-muted-foreground">No hay productos todavía.</p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products?.map((product) => (
          <Card key={product.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>
                <Link href={`/products/${product.id}`} className="hover:underline">
                  {product.name}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-xl font-semibold">{formatCLP(product.unit_price!)}</p>
            </CardContent>
            <CardFooter>
              <AddToCartButton
                productId={product.id}
                name={product.name!}
                unitPrice={product.unit_price!}
              />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
