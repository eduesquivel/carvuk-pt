"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCart } from "./cart-provider";

export function CartLink() {
  const { itemCount } = useCart();

  return (
    <Link href="/cart" className="flex items-center gap-1.5 hover:underline">
      <ShoppingCart className="size-4" />
      Carrito
      {itemCount > 0 && <Badge>{itemCount}</Badge>}
    </Link>
  );
}
