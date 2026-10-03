import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useApp } from "@/lib/app";

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

// Same rules as the website's lib/cart.tsx:
// Guests: the cart lives on this phone.
// Signed in: the cart lives in the database via /api/cart, shared with the
// website, and Supabase Realtime pushes every change here instantly.
export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, supabase, api } = useApp();
  const userId = user?.id ?? null;
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  const readGuest = async (): Promise<CartItem[]> => {
    try {
      return JSON.parse((await AsyncStorage.getItem(STORAGE_KEY)) ?? "[]");
    } catch {
      return [];
    }
  };
  const writeGuest = (next: CartItem[]) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  };

  // The API replies with the saved cart, so show that.
  const send = useCallback(
    async (method: string, body?: object) => {
      try {
        const res = await api("/api/cart", {
          method,
          headers: body ? { "Content-Type": "application/json" } : undefined,
          body: body ? JSON.stringify(body) : undefined,
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && Array.isArray(data.items)) setItems(data.items);
        return res.ok;
      } catch {
        return false; // offline: keep what's on screen
      }
    },
    [api]
  );

  // Load the right cart whenever the signed-in customer changes.
  useEffect(() => {
    let cancelled = false;
    setReady(false);
    (async () => {
      if (!userId) {
        const guest = await readGuest();
        if (!cancelled) {
          setItems(guest);
          setReady(true);
        }
        return;
      }
      // Just signed in: move anything added as a guest into the shared cart.
      const guest = await readGuest();
      for (const i of guest) await send("POST", { productId: i.productId, quantity: i.quantity });
      if (guest.length) writeGuest([]);
      if (!cancelled) {
        await send("GET");
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, send]);

  // Live updates from the website or another phone.
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`cart-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "cart_items", filter: `user_id=eq.${userId}` }, () => {
        send("GET");
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase, send]);

  const value = useMemo<CartContextValue>(() => {
    const signedIn = !!userId;

    // Update the screen straight away, then save.
    const update = (next: CartItem[], save: () => Promise<unknown>) => {
      setItems(next);
      if (signedIn) save();
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
          ? items.map((i) =>
              i.productId === item.productId ? { ...i, stock: item.stock, quantity: Math.min(item.stock, i.quantity + quantity) } : i
            )
          : [...items, { ...item, quantity: Math.min(item.stock, quantity) }];
        update(next, () => send("POST", { productId: item.productId, quantity }));
      },
      setQuantity: (productId, quantity) => {
        const item = items.find((i) => i.productId === productId);
        if (!item) return;
        const q = Math.max(1, Math.min(item.stock, quantity));
        update(
          items.map((i) => (i.productId === productId ? { ...i, quantity: q } : i)),
          () => send("PATCH", { productId, quantity: q })
        );
      },
      removeItem: (productId) =>
        update(
          items.filter((i) => i.productId !== productId),
          () => send("PATCH", { productId, quantity: 0 })
        ),
      // After a paid order. Signed in: the server already removed the paid
      // wreaths from the shared cart, so just reload it. Guest: empty it.
      clear: () => {
        if (signedIn) send("GET");
        else {
          setItems([]);
          writeGuest([]);
        }
      },
    };
  }, [items, ready, userId, send]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
