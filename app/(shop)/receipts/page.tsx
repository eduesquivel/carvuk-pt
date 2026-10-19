import Link from "next/link";
import { formatCLP, formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export default async function ReceiptsPage() {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims.sub;

  let query = supabase
    .from("receipt")
    .select("id, created_at, gross_value, carts(quantity)")
    .order("created_at", { ascending: false });
  if (userId) query = query.eq("user_id", userId);

  const { data: receipts, error } = await query;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Historial de boletas</h1>
      {error && <p className="text-destructive">No se pudo cargar el historial.</p>}
      {receipts?.length === 0 && (
        <p className="text-muted-foreground">
          Aún no has generado boletas.{" "}
          <Link href="/products" className="underline">
            Ir al catálogo
          </Link>
        </p>
      )}
      {receipts && receipts.length > 0 && (
        <table className="w-full text-sm">
          <thead className="border-b text-left text-muted-foreground">
            <tr>
              <th className="py-2">N° boleta</th>
              <th>Fecha</th>
              <th className="text-right">Productos</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {receipts.map((r) => (
              <tr key={r.id} className="hover:bg-muted/50">
                <td className="py-3">
                  <Link href={`/receipts/${r.id}`} className="font-medium underline">
                    #{r.id}
                  </Link>
                </td>
                <td>{formatDate(r.created_at)}</td>
                <td className="text-right tabular-nums">
                  {r.carts.reduce((sum, c) => sum + (c.quantity ?? 0), 0)}
                </td>
                <td className="text-right font-medium tabular-nums">
                  {formatCLP(r.gross_value ?? 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
