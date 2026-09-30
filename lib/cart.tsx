"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  productId: string;
  name: string;
  price_kobo: number;
  image_url: string | null;
  stock: number;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  ready: boolean;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "tafritessy-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  // Load the saved cart once in the browser.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setItems(JSON.parse(saved));
    } catch {}
    setReady(true);
  }, []);

  // Save on every change (after the first load).
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, ready]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    ready,
    count: items.reduce((n, i) => n + i.quantity, 0),
    subtotal: items.reduce((n, i) => n + i.price_kobo * i.quantity, 0),
    addItem: (item, quantity = 1) =>
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === item.productId);
        if (existing) {
          return prev.map((i) =>
            i.productId === item.productId
              ? { ...i, stock: item.stock, quantity: Math.min(item.stock, i.quantity + quantity) }
              : i
          );
        }
        return [...prev, { ...item, quantity: Math.min(item.stock, quantity) }];
      }),
    setQuantity: (productId, quantity) =>
      setItems((prev) =>
        prev.map((i) =>
          i.productId === productId ? { ...i, quantity: Math.max(1, Math.min(i.stock, quantity)) } : i
        )
      ),
    removeItem: (productId) => setItems((prev) => prev.filter((i) => i.productId !== productId)),
    clear: () => setItems([]),
  }), [items, ready]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
