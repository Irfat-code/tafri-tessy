import { NextResponse } from "next/server";
import { DELIVERY_KOBO } from "@/lib/config";

// Public settings for the mobile app, so the app only needs the site URL.
// Everything here is already sent to every browser that opens the website.
export function GET() {
  return NextResponse.json(
    {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
      whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
      deliveryKobo: DELIVERY_KOBO,
    },
    { headers: { "Cache-Control": "public, max-age=300" } }
  );
}
