import { NextResponse } from "next/server";
import { getRequestUser } from "@/lib/requestUser";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// GET /api/orders -> the signed-in customer's paid and delivered orders
export async function GET(req: Request) {
  const user = await getRequestUser(req);
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const { data } = await supabaseAdmin
    .from("orders")
    .select("id, order_no, status, total_kobo, created_at, city, state, order_items(quantity, unit_price_kobo, products(name, image_url))")
    .eq("user_id", user.id)
    .in("status", ["paid", "delivered"])
    .order("created_at", { ascending: false });
  return NextResponse.json({ orders: data ?? [] });
}
