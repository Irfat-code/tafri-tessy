import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// GET /api/products/:id -> one wreath
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data } = await supabaseAdmin
    .from("products")
    .select("id, name, description, price_kobo, category, image_url, stock, is_available")
    .eq("id", id)
    .maybeSingle();
  if (!data || !data.is_available) return NextResponse.json({ error: "Wreath not found." }, { status: 404 });
  return NextResponse.json({ product: data });
}
