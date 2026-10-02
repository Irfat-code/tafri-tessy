import { API_URL } from "./config";
import { supabase } from "./supabase";

// Calls the same API endpoints the website uses, signed in with the user's token.
export async function api<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const res = await fetch(API_URL + path, {
    method: init.method ?? "GET",
    headers: {
      ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? `Request failed (${res.status})`);
  return json as T;
}

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price_kobo: number;
  category: string;
  image_url: string | null;
  stock: number;
};

export type CartItem = {
  productId: string;
  name: string;
  price_kobo: number;
  image_url: string | null;
  stock: number;
  quantity: number;
};

export type Order = {
  id: string;
  order_no: number;
  status: string;
  total_kobo: number;
  created_at: string;
  city: string;
  state: string;
  order_items: { quantity: number; unit_price_kobo: number; products: { name: string } | null }[];
};
