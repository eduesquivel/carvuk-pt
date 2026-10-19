"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { calculateGross, calculateTotals, type ReceiptTotals } from "@/lib/receipts/tax";

export type CartItem = {
  productId: number;
  name: string;
  unitPrice: number;
  quantity: number;
};

type CartAction =
  | { type: "add"; item: Omit<CartItem, "quantity">; quantity?: number }
  | { type: "setQuantity"; productId: number; quantity: number }
  | { type: "remove"; productId: number }
  | { type: "clear" }
  | { type: "hydrate"; items: CartItem[] };

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case "add": {
      const quantity = action.quantity ?? 1;
      const existing = state.find((i) => i.productId === action.item.productId);
      if (existing) {
        return state.map((i) =>
          i.productId === action.item.productId
            ? { ...i, quantity: i.quantity + quantity }
            : i,
        );
      }
      return [...state, { ...action.item, quantity }];
    }
    case "setQuantity":
      if (action.quantity <= 0) {
        return state.filter((i) => i.productId !== action.productId);
      }
      return state.map((i) =>
        i.productId === action.productId ? { ...i, quantity: action.quantity } : i,
      );
    case "remove":
      return state.filter((i) => i.productId !== action.productId);
    case "clear":
      return [];
    case "hydrate":
      return action.items;
  }
}

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  totals: ReceiptTotals;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "carrito-feliz:cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, dispatch] = useReducer(cartReducer, []);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) dispatch({ type: "hydrate", items: JSON.parse(stored) });
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
      totals: calculateTotals(calculateGross(items)),
      addItem: (item, quantity) => dispatch({ type: "add", item, quantity }),
      setQuantity: (productId, quantity) =>
        dispatch({ type: "setQuantity", productId, quantity }),
      removeItem: (productId) => dispatch({ type: "remove", productId }),
      clear: () => dispatch({ type: "clear" }),
    }),
    [items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
