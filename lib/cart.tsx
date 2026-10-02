"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabaseBrowser";

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
  signedIn: boolean;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "tafritessy-cart";

// Guests: the cart lives in this browser (localStorage).
// Signed in: the cart lives in the database via /api/cart, shared with the
// mobile app, and Supabase Realtime pushes every change here instantly.
export function CartProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const userIdRef = useRef<string | null>(null);

  const readGuest = (): CartItem[] => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"); } catch { return []; }
  };
  const writeGuest = (next: CartItem[]) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  };

  const api = useCallback(async (method: string, body?: object) => {
    const res = await fetch("/api/cart", {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && Array.isArray(data.items)) setItems(data.items);
    return res.ok;
  }, []);

  // Work out who is signed in, and follow sign-in / sign-out.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUserId(data.session?.user.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  // Load the right cart whenever the signed-in user changes.
  useEffect(() => {
    userIdRef.current = userId;
    let cancelled = false;
    (async () => {
      if (!userId) {
        setItems(readGuest());
        setReady(true);
        return;
      }
      // Just signed in: move anything added as a guest into the shared cart.
      const guest = readGuest();
      for (const i of guest) await api("POST", { productId: i.productId, quantity: i.quantity });
      if (guest.length) writeGuest([]);
      if (!cancelled) {
        await api("GET");
        setReady(true);
      }
    })();
    return () => { cancelled = true; };
  }, [userId, api]);

  // Live updates: any change to this customer's cart (from the app or another tab).
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`cart-${userId}`)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "cart_items", filter: `user_id=eq.${userId}` },
        () => { api("GET"); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId, supabase, api]);

  const value = useMemo<CartContextValue>(() => {
    const signedIn = !!userId;

    // Update the screen straight away, then save.
    const update = (next: CartItem[], save: () => Promise<unknown>) => {
      setItems(next);
      if (signedIn) save(); // the API replies with the saved cart
      else writeGuest(next);
    };

    return {
      items,
      ready,
      signedIn,
      count: items.reduce((n, i) => n + i.quantity, 0),
      subtotal: items.reduce((n, i) => n + i.price_kobo * i.quantity, 0),
      addItem: (item, quantity = 1) => {
        const existing = items.find((i) => i.productId === item.productId);
        const next = existing
          ? items.map((i) => i.productId === item.productId
              ? { ...i, stock: item.stock, quantity: Math.min(item.stock, i.quantity + quantity) } : i)
          : [...items, { ...item, quantity: Math.min(item.stock, quantity) }];
        update(next, () => api("POST", { productId: item.productId, quantity }));
      },
      setQuantity: (productId, quantity) => {
        const item = items.find((i) => i.productId === productId);
        if (!item) return;
        const q = Math.max(1, Math.min(item.stock, quantity));
        update(items.map((i) => (i.productId === productId ? { ...i, quantity: q } : i)),
          () => api("PATCH", { productId, quantity: q }));
      },
      removeItem: (productId) =>
        update(items.filter((i) => i.productId !== productId),
          () => api("PATCH", { productId, quantity: 0 })),
      // After a paid order. Signed in: the server already removed the paid
      // wreaths from the shared cart, so just reload it. Guest: empty it.
      clear: () => {
        if (signedIn) api("GET");
        else { setItems([]); writeGuest([]); }
      },
    };
  }, [items, ready, userId, api]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
