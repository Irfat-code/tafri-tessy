import { naira, orderCode } from "@/lib/format";

// Escape anything a customer typed before it goes into an email.
export function esc(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "";

function button(href: string, label: string) {
  return `<p style="margin-top:24px"><a href="${href}" style="background:#d9667a;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none">${label}</a></p>`;
}

function layout(title: string, body: string) {
  return `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#2a2a2a">
  <h1 style="font-family:Georgia,serif;color:#1f4d3a">🌸 TafriTessy</h1>
  <h2 style="color:#d9667a">${title}</h2>
  ${body}
  <p style="margin-top:32px;font-size:12px;color:#888">TafriTessy · Wreaths • Designs • More</p>
</div>`;
}

type Order = {
  order_no: number;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  subtotal_kobo: number;
  delivery_kobo: number;
  total_kobo: number;
};
type Line = { name: string; quantity: number; unit_price_kobo: number };

function orderTable(order: Order, lines: Line[]) {
  const rows = lines
    .map((l) => `<tr><td>${esc(l.name)} × ${l.quantity}</td><td align="right">${naira(l.unit_price_kobo * l.quantity)}</td></tr>`)
    .join("");
  return `<table width="100%" cellpadding="6" style="border-collapse:collapse">
  ${rows}
  <tr><td>Delivery</td><td align="right">${naira(order.delivery_kobo)}</td></tr>
  <tr style="font-weight:bold;border-top:1px solid #ddd"><td>Total paid</td><td align="right">${naira(order.total_kobo)}</td></tr>
</table>
<p><strong>Deliver to:</strong><br>${esc(order.full_name)}<br>${esc(order.address)}<br>${esc(order.city)}, ${esc(order.state)}<br>${esc(order.phone)}</p>`;
}

export function customerOrderEmail(order: Order, lines: Line[]) {
  return {
    subject: `Your TafriTessy order #${orderCode(order.order_no)} is confirmed`,
    html: layout(
      "Thank you for your order!",
      `<p>Hi ${esc(order.full_name)}, we've received your payment. We'll be in touch soon about delivery.</p>
       <p><strong>Order #${orderCode(order.order_no)}</strong></p>${orderTable(order, lines)}
       ${button(`${SITE}/account?tab=orders`, "View my orders")}
       <p style="font-size:13px;color:#666">Questions? Just reply to this email.</p>`
    ),
  };
}

export function ownerOrderEmail(order: Order, lines: Line[]) {
  return {
    subject: `New paid order #${orderCode(order.order_no)} (${naira(order.total_kobo)})`,
    html: layout(
      "New order received 🎉",
      `<p>From ${esc(order.full_name)} (${esc(order.email)})</p>${orderTable(order, lines)}`
    ),
  };
}

type Booking = {
  full_name: string;
  email: string;
  phone: string;
  occasion: string;
  preferred_date: string | null;
  wreath_type: string | null;
  colours: string | null;
  budget: string | null;
  description: string | null;
};

function bookingDetails(b: Booking) {
  const row = (label: string, value: unknown) =>
    value ? `<tr><td style="color:#888">${label}</td><td>${esc(value)}</td></tr>` : "";
  return `<table cellpadding="6">
  ${row("Occasion", b.occasion)}${row("Date needed", b.preferred_date)}${row("Wreath type", b.wreath_type)}
  ${row("Colours", b.colours)}${row("Budget", b.budget)}${row("Details", b.description)}
</table>`;
}

export function customerBookingEmail(b: Booking) {
  return {
    subject: "We've received your custom wreath request 🌸",
    html: layout(
      "Your request is in!",
      `<p>Hi ${esc(b.full_name)}, thank you for your custom wreath request. We'll review it and get back to you within 24–48 hours with a quote.</p>${bookingDetails(b)}
       <p style="font-size:13px;color:#666">Want to add anything? Just reply to this email.</p>`
    ),
  };
}

export function ownerBookingEmail(b: Booking, inspirationLink: string | null) {
  return {
    subject: `New custom wreath request: ${b.occasion} from ${b.full_name}`,
    html: layout(
      "New custom booking",
      `<p><strong>${esc(b.full_name)}</strong><br><a href="mailto:${esc(b.email)}">${esc(b.email)}</a><br>${esc(b.phone)}</p>${bookingDetails(b)}
       ${inspirationLink ? `<p><a href="${esc(inspirationLink)}">View inspiration photo</a> (link works for 7 days)</p>` : ""}`
    ),
  };
}
