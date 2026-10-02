import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type ServerCartItem = {
  productId: string;
  name: string;
  price_kobo: number;
  image_url: string | null;
  stock: number;
  quantity: number;
};

// The signed-in customer's cart, with live prices and stock from the database.
export async function readCart(userId: string): Promise<ServerCartItem[]> {
  const { data } = await supabaseAdmin
    .from("cart_items")
    .select("product_id, quantity, updated_at, products(name, price_kobo, image_url, stock, is_available)")
    .eq("user_id", userId)
    .gt("quantity", 0)
    .order("updated_at", { ascending: true });

  type Row = {
    product_id: string; quantity: number;
    products: { name: string; price_kobo: number; image_url: string | null; stock: number; is_available: boolean } | null;
  };
  return ((data ?? []) as unknown as Row[])
    .filter((r) => r.products && r.products.is_available)
    .map((r) => ({
      productId: r.product_id,
      name: r.products!.name,
      price_kobo: r.products!.price_kobo,
      image_url: r.products!.image_url,
      stock: r.products!.stock,
      quantity: Math.min(r.quantity, r.products!.stock),
    }))
    .filter((i) => i.quantity > 0);
}

// Sets one product's quantity (0 removes it), capped at what's in stock.
export async function setCartQuantity(userId: string, productId: string, quantity: number) {
  const { data: product } = await supabaseAdmin
    .from("products").select("stock, is_available").eq("id", productId).single();
  if (!product || !product.is_available) throw new Error("This wreath is no longer available.");
  const qty = Math.max(0, Math.min(Math.floor(quantity), product.stock));
  const { error } = await supabaseAdmin.from("cart_items").upsert(
    { user_id: userId, product_id: productId, quantity: qty, updated_at: new Date().toISOString() },
    { onConflict: "user_id,product_id" }
  );
  if (error) throw new Error(error.message);
}

export async function currentQuantity(userId: string, productId: string) {
  const { data } = await supabaseAdmin
    .from("cart_items").select("quantity").eq("user_id", userId).eq("product_id", productId).maybeSingle();
  return data?.quantity ?? 0;
}

// Empties the cart, or only the given products (e.g. the ones just paid for).
export async function clearCart(userId: string, productIds?: string[]) {
  let query = supabaseAdmin
    .from("cart_items")
    .update({ quantity: 0, updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .gt("quantity", 0);
  if (productIds) query = query.in("product_id", productIds);
  await query;
}
