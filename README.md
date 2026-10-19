# 🛒 Carrito Feliz

Mini e-commerce para mantener un catálogo, armar un carrito y generar boletas con cálculo automático de impuesto (15%).

**Stack:** Next.js (App Router, Server Actions) · Supabase (Postgres + Auth) · Tailwind + shadcn/ui · Vitest.

## Funcionalidades

| Ruta | Descripción |
|---|---|
| `/products` | Catálogo de productos |
| `/products/[id]` | Detalle de un producto |
| `/cart` | Carrito (vive en el front, con `localStorage`): agregar, cambiar cantidad, quitar y **Generar boleta** |
| `/receipts` | Historial de boletas del usuario |
| `/receipts/[id]` | Desglose de la boleta: productos, neto, impuesto y total |

## Modelo de datos

- `products`: `id`, `name`, `unit_price`
- `receipt`: `id`, `user_id`, `gross_value`, `tax`, `net_value`, `created_at` (cabecera de la boleta)
- `carts`: `id`, `receipt_id → receipt`, `product_id → products`, `quantity` (líneas de la boleta)

> El carrito "activo" no se persiste; la tabla `carts` guarda las líneas de cada boleta ya generada.

## Cálculo del impuesto

La regla vive en un solo lugar: `lib/receipts/tax.ts`.

```
bruto    = Σ precio × cantidad   (lo que paga el cliente)
impuesto = round(bruto × 0.15)
neto     = bruto − impuesto
```

Ejemplo: 2 leches ($1.100) + 1 aceite ($2.000) → bruto $4.200, impuesto $630, neto $3.570.

La boleta se genera en la **Server Action** `app/(shop)/cart/actions.ts` (`createReceipt`):

1. Valida el carrito con zod (al menos un ítem, cantidades enteras positivas) y agrupa productos repetidos.
2. Lee los precios **desde la base** e ignora los que vengan del cliente.
3. Calcula bruto, impuesto y neto con `calculateTotals`.
4. Inserta la cabecera en `receipt` y luego las líneas en `carts`.
5. Si falla el insert de las líneas, borra la cabecera (compensación) para no dejar boletas sin productos.

El front reutiliza `calculateTotals` para mostrar una estimación en el carrito, pero lo que se guarda siempre lo calcula el servidor.

## Desarrollo

```bash
cp .env.example .env.local   # NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
npm install
npm run dev
npm test
```

Para usar la app hay que registrarse e iniciar sesión (`/auth/sign-up`); las boletas quedan asociadas al usuario.

## Limitaciones conocidas / próximos pasos

- **Atomicidad:** los dos inserts no corren en una transacción; la compensación cubre los errores normales, pero si el proceso muere entre ambos podría quedar una boleta sin líneas.
- **Precio histórico:** `carts` no guarda el precio unitario al momento de la venta. Los totales de la boleta sí quedan fijos, pero el desglose por línea muestra el precio actual del producto. Agregar `carts.unit_price` lo resolvería.
- Migraciones versionadas con Supabase CLI (`supabase db pull`) y tipos generados (`supabase gen types`); hoy `lib/supabase/database.types.ts` está escrito a mano.
