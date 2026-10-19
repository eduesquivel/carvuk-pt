import { CartView } from "./cart-view";

export default function CartPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Carrito</h1>
      <CartView />
    </div>
  );
}
