import crypto from "crypto";
import { NextResponse } from "next/server";
import { fulfillOrder } from "@/lib/orders";

// Paystack calls this after a payment. Set the URL in
// Paystack → Settings → API Keys & Webhooks → Test Webhook URL.
export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";
  const expected = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY ?? "")
    .update(raw)
    .digest("hex");

  const valid =
    signature.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!valid) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

  const event = JSON.parse(raw);
  if (event.event === "charge.success" && typeof event.data?.reference === "string") {
    await fulfillOrder(event.data.reference);
  }
  return NextResponse.json({ received: true });
}
