import { supabaseAdmin } from "./supabaseAdmin";
import { sendOrderEmails } from "./emails";

// Safe to call many times (webhook AND the order page both call it).
export async function fulfillOrder(orderId: string, paidKobo: number) {
  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("*, order_items(quantity, unit_price_kobo, product_id, products(name))")
    .eq("id", orderId)
    .single();

  if (!order) return { ok: false };
  if (order.status === "paid") return { ok: true };
  if (paidKobo !== order.total_kobo) return { ok: false, reason: "amount mismatch" };

  // Only the call that flips pending -> paid continues, so emails/stock run once.
  const { data: updated } = await supabaseAdmin
    .from("orders").update({ status: "paid" }).eq("id", orderId).eq("status", "pending").select("id");
  if (!updated || updated.length === 0) return { ok: true };

  for (const item of order.order_items) {
    const { data: p } = await supabaseAdmin.from("products").select("stock").eq("id", item.product_id).single();
    if (p) {
      await supabaseAdmin.from("products")
        .update({ stock: Math.max(0, p.stock - item.quantity) }).eq("id", item.product_id);
    }
  }
  await sendOrderEmails(order);
  return { ok: true };
}
