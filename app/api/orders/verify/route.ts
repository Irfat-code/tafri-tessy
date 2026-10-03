import { NextResponse } from "next/server";
import { fulfillOrder } from "@/lib/orders";

// The mobile app calls this after Paystack's payment page, the same way the
// website's thank-you page does: /api/orders/verify?reference=...
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const reference = searchParams.get("reference") ?? searchParams.get("trxref");
  if (!reference) return NextResponse.json({ error: "Missing payment reference." }, { status: 400 });

  const order = await fulfillOrder(reference);
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  // Only what the thank-you page shows.
  return NextResponse.json({
    order_no: order.order_no,
    status: order.status,
    total_kobo: order.total_kobo,
    full_name: order.full_name,
    email: order.email,
    city: order.city,
    state: order.state,
  });
}
