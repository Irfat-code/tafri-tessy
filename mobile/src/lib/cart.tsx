import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, type CartItem } from "./api";
import { useAuth } from "./auth";
import { supabase } from "./supabase";

type CartValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  loading: boolean;
  refresh: () => Promise<void>;
  add: (productId: string, quantity: number) => Promise<void>;
  setQuantity: (productId: string, quantity: number) => Promise<void>;
  remove: (productId: string) => Promise<void>;
};

const CartContext = createContext<CartValue | null>(null);

// The cart is the same one the website uses (/api/cart). Supabase Realtime
// tells the app the moment it changes anywhere, e.g. on the website.
export function CartProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId) { setItems([]); return; }
    try {
      const data = await api<{ items: CartItem[] }>("/api/cart");
      setItems(data.items);
    } catch {
      // keep what we have; the next change will try again
    }
  }, [userId]);

  useEffect(() => {
    setLoading(true);
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  // Live updates from the website (or another phone).
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`cart-${userId}`)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "cart_items", filter: `user_id=eq.${userId}` },
        () => { refresh(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId, refresh]);

  const value = useMemo<CartValue>(() => {
    const send = async (method: string, productId: string, quantity: number) => {
      const data = await api<{ items: CartItem[] }>("/api/cart", { method, body: { productId, quantity } });
      setItems(data.items);
    };
    return {
      items,
      loading,
      refresh,
      count: items.reduce((n, i) => n + i.quantity, 0),
      subtotal: items.reduce((n, i) => n + i.price_kobo * i.quantity, 0),
      add: (productId, quantity) => send("POST", productId, quantity),
      setQuantity: (productId, quantity) => {
        // Show the change straight away, then save it.
        setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, quantity } : i)));
        return send("PATCH", productId, quantity);
      },
      remove: (productId) => {
        setItems((prev) => prev.filter((i) => i.productId !== productId));
        return send("PATCH", productId, 0);
      },
    };
  }, [items, loading, refresh]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
