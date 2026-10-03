import { useCallback, useEffect, useRef, useState } from "react";

// The same tables and columns the website reads. Row Level Security on
// Supabase decides what each customer can see.
export type Product = {
  id: string;
  name: string;
  price_kobo: number;
  image_url: string | null;
  category: string;
};

export type ProductDetail = Product & {
  description: string | null;
  stock: number;
  is_available: boolean;
};

export type OrderRow = {
  id: string;
  order_no: number;
  status: string;
  total_kobo: number;
  created_at: string;
  city: string;
  state: string;
  order_items: {
    quantity: number;
    unit_price_kobo: number;
    products: { name: string; image_url: string | null } | null;
  }[];
};

export type BookingRow = {
  id: string;
  occasion: string;
  wreath_type: string | null;
  preferred_date: string | null;
  budget: string | null;
  status: string;
  created_at: string;
};

export type SavedProduct = { id: string; name: string; price_kobo: number; image_url: string | null; stock: number };

// Small loader hook: runs `load`, keeps the result, and supports pull-to-refresh.
export function useLoader<T>(load: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const latest = useRef(0);

  const run = useCallback(
    async (mode: "load" | "refresh") => {
      const id = ++latest.current;
      if (mode === "refresh") setRefreshing(true);
      else setLoading(true);
      try {
        const result = await load();
        if (id !== latest.current) return;
        setData(result);
        setError(null);
      } catch (err) {
        if (id !== latest.current) return;
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        if (id === latest.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps
  );

  useEffect(() => {
    run("load");
  }, [run]);

  return {
    data,
    error,
    loading,
    refreshing,
    refresh: () => run("refresh"),
    reload: () => run("load"),
  };
}

// Supabase returns { data, error }; turn an error into a thrown one.
export function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error("Could not load. Check your connection and try again.");
  return res.data as T;
}
