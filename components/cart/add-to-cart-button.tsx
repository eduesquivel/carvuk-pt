"use client";

import { useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "./cart-provider";

type Props = {
  productId: number;
  name: string;
  unitPrice: number;
};

export function AddToCartButton({ productId, name, unitPrice }: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <Button
      size="sm"
      onClick={() => {
        addItem({ productId, name, unitPrice });
        setAdded(true);
        setTimeout(() => setAdded(false), 1200);
      }}
    >
      {added ? <Check /> : <ShoppingCart />}
      {added ? "Agregado" : "Agregar al carrito"}
    </Button>
  );
}
