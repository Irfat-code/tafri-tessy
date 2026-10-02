import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// GET /api/products?category=wedding  -> wreaths shown in the shop
export async function GET(req: Request) {
  const category = new URL(req.url).searchParams.get("category");
  let query = supabaseAdmin
    .from("products")
    .select("id, name, description, price_kobo, category, image_url, stock")
    .eq("is_available", true)
    .order("created_at", { ascending: true });
  if (category) query = query.eq("category", category);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: "Could not load wreaths." }, { status: 500 });
  return NextResponse.json({ products: data });
}
