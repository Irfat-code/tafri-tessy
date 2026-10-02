import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getRequestUser } from "@/lib/requestUser";
import { initializeTransaction } from "@/lib/paystack";
import { DELIVERY_KOBO } from "@/lib/config";
import { NIGERIAN_STATES } from "@/lib/nigeria";

const FIELDS = ["full_name", "email", "phone", "address", "city", "state"] as const;

function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return fail("Invalid request.");

  // 1. Check the delivery details.
  const customer = {} as Record<(typeof FIELDS)[number], string>;
  for (const f of FIELDS) {
    const v = typeof body[f] === "string" ? body[f].trim() : "";
    if (!v || v.length > 300) return fail("Please fill in all delivery details.");
    customer[f] = v;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) return fail("Please enter a valid email address.");
  if (!/^[+\d][\d\s-]{6,19}$/.test(customer.phone)) return fail("Please enter a valid phone number.");
  if (!NIGERIAN_STATES.includes(customer.state)) return fail("Please choose your state.");

  // 2. Check the cart. Only product IDs and quantities are used from the browser.
  if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 50) {
    return fail("Your cart is empty.");
  }
  const wanted = new Map<string, number>();
  for (const item of body.items) {
    const qty = Number(item?.quantity);
    if (typeof item?.productId !== "string" || !Number.isInteger(qty) || qty < 1 || qty > 99) {
      return fail("Your cart has an invalid item.");
    }
    wanted.set(item.productId, (wanted.get(item.productId) ?? 0) + qty);
  }

  // 3. Real prices and stock come from the database.
  const { data: products, error } = await supabaseAdmin
    .from("products")
    .select("id, name, price_kobo, stock, is_available")
    .in("id", [...wanted.keys()]);
  if (error) return fail("Could not load products. Please try again.", 500);

  let subtotal = 0;
  const lines = [];
  for (const [productId, quantity] of wanted) {
    const p = products?.find((x) => x.id === productId);
    if (!p || !p.is_available) return fail("A wreath in your cart is no longer available.", 409);
    if (p.stock < quantity) {
      return fail(p.stock === 0 ? `Sorry, ${p.name} just sold out.` : `Only ${p.stock} of ${p.name} left.`, 409);
    }
    subtotal += p.price_kobo * quantity;
    lines.push({ product_id: p.id, quantity, unit_price_kobo: p.price_kobo });
  }
  const total = subtotal + DELIVERY_KOBO;

  // 4. Link the order to the signed-in customer, if any.
  const user = await getRequestUser(req);

  // 5. Save the order as "pending" and its items.
  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .insert({
      ...customer,
      user_id: user?.id ?? null,
      subtotal_kobo: subtotal,
      delivery_kobo: DELIVERY_KOBO,
      total_kobo: total,
    })
    .select("id, order_no")
    .single();
  if (orderError || !order) {
    console.error(orderError);
    return fail("Could not create your order. Please try again.", 500);
  }

  const { error: itemsError } = await supabaseAdmin
    .from("order_items")
    .insert(lines.map((l) => ({ ...l, order_id: order.id })));
  if (itemsError) {
    console.error(itemsError);
    await supabaseAdmin.from("orders").delete().eq("id", order.id);
    return fail("Could not create your order. Please try again.", 500);
  }

  // 6. Start the Paystack payment.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
  const reference = `TT-${order.order_no}-${order.id.slice(0, 8)}`;
  try {
    const tx = await initializeTransaction({
      email: customer.email,
      amount: total,
      reference,
      callback_url: `${siteUrl}/checkout/success`,
      metadata: { order_id: order.id },
    });
    await supabaseAdmin.from("orders").update({ paystack_reference: reference }).eq("id", order.id);
    return NextResponse.json({ url: tx.authorization_url });
  } catch (err) {
    console.error("Paystack initialize failed", err);
    await supabaseAdmin.from("orders").update({ status: "cancelled" }).eq("id", order.id);
    return fail("Could not start payment. Please try again.", 502);
  }
}
