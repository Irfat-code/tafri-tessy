import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyTransaction } from "@/lib/paystack";
import { sendMail } from "@/lib/mailgun";
import { customerOrderEmail, ownerOrderEmail } from "@/lib/emails";

// Checks a payment with Paystack and, if it's good, marks the order paid,
// reduces stock and sends the emails. Safe to call more than once
// (from the webhook and from the thank-you page): only the first call acts.
export async function fulfillOrder(reference: string) {
  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("paystack_reference", reference)
    .single();
  if (!order) return null;
  if (order.status !== "pending") return order;

  let tx;
  try {
    tx = await verifyTransaction(reference);
  } catch (err) {
    console.error("Paystack verify failed", err);
    return order;
  }

  // Never trust a payment for the wrong amount.
  if (tx.status !== "success" || tx.amount !== order.total_kobo || tx.currency !== "NGN") {
    return order;
  }

  const { data: marked, error } = await supabaseAdmin.rpc("mark_order_paid", { p_order_id: order.id });
  if (error) {
    console.error("mark_order_paid failed", error);
    return order;
  }

  const paidOrder = { ...order, status: "paid" };
  if (marked) await sendOrderEmails(paidOrder);
  return paidOrder;
}

async function sendOrderEmails(order: Parameters<typeof customerOrderEmail>[0] & { id: string; email: string }) {
  const { data: items } = await supabaseAdmin
    .from("order_items")
    .select("quantity, unit_price_kobo, products(name)")
    .eq("order_id", order.id);

  const lines = (items ?? []).map((i) => ({
    quantity: i.quantity,
    unit_price_kobo: i.unit_price_kobo,
    name: (i.products as unknown as { name: string } | null)?.name ?? "Wreath",
  }));

  const toCustomer = customerOrderEmail(order, lines);
  await sendMail(order.email, toCustomer.subject, toCustomer.html);

  if (process.env.OWNER_EMAIL) {
    const toOwner = ownerOrderEmail(order, lines);
    await sendMail(process.env.OWNER_EMAIL, toOwner.subject, toOwner.html);
  }
}
