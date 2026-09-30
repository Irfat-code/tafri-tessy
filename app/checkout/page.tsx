"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { naira } from "@/lib/format";
import { DELIVERY_KOBO } from "@/lib/config";
import { NIGERIAN_STATES } from "@/lib/nigeria";
import { createClient } from "@/lib/supabaseBrowser";

const input = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-rose focus:outline-none";

export default function CheckoutPage() {
  const { items, subtotal, ready } = useCart();
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", address: "", city: "", state: "Lagos" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fill in name and email for signed-in customers.
  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setForm((f) => ({
        ...f,
        full_name: f.full_name || user.user_metadata?.full_name || "",
        email: f.email || user.email || "",
      }));
    });
  }, []);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      window.location.href = data.url; // Paystack payment page
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  if (!ready) return <main className="mx-auto max-w-5xl px-4 py-16 text-center text-gray-500">Loading…</main>;

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-20 text-center">
        <h1 className="font-serif text-3xl text-forest">Your cart is empty</h1>
        <Link href="/shop" className="mt-6 inline-block rounded-full bg-rose px-7 py-3 text-sm font-medium text-white hover:bg-rose-dark">
          Browse Wreaths
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Link href="/cart" className="text-sm text-gray-600 hover:text-rose">← Back to cart</Link>
      <h1 className="mt-2 font-serif text-3xl text-forest">Checkout</h1>

      <form onSubmit={placeOrder} className="mt-6 grid gap-8 md:grid-cols-[1fr_340px]">
        <section className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="font-serif text-xl text-forest">Delivery Details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm sm:col-span-2">Full name
              <input required value={form.full_name} onChange={set("full_name")} className={input} autoComplete="name" />
            </label>
            <label className="text-sm">Email
              <input required type="email" value={form.email} onChange={set("email")} className={input} autoComplete="email" />
            </label>
            <label className="text-sm">Phone
              <input required type="tel" value={form.phone} onChange={set("phone")} className={input} placeholder="0801 234 5678" autoComplete="tel" />
            </label>
            <label className="text-sm sm:col-span-2">Delivery address
              <input required value={form.address} onChange={set("address")} className={input} autoComplete="street-address" />
            </label>
            <label className="text-sm">City
              <input required value={form.city} onChange={set("city")} className={input} autoComplete="address-level2" />
            </label>
            <label className="text-sm">State
              <select required value={form.state} onChange={set("state")} className={input}>
                {NIGERIAN_STATES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
          </div>
          <p className="text-xs text-gray-500">Your order confirmation will be sent to this email.</p>
        </section>

        <aside className="h-fit space-y-3 rounded-xl bg-white p-5 shadow-sm">
          <h2 className="font-serif text-xl text-forest">Order Summary</h2>
          {items.map((i) => (
            <div key={i.productId} className="flex items-center gap-3 text-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={i.image_url ?? "https://placehold.co/100x100"} alt="" className="h-12 w-12 rounded object-cover" />
              <span className="flex-1">{i.name} × {i.quantity}</span>
              <span>{naira(i.price_kobo * i.quantity)}</span>
            </div>
          ))}
          <div className="flex justify-between border-t pt-3 text-sm"><span>Subtotal</span><span>{naira(subtotal)}</span></div>
          <div className="flex justify-between text-sm"><span>Delivery</span><span>{naira(DELIVERY_KOBO)}</span></div>
          <div className="flex justify-between border-t pt-3 text-lg font-semibold"><span>Total</span><span>{naira(subtotal + DELIVERY_KOBO)}</span></div>

          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

          <button disabled={loading}
            className="w-full rounded-full bg-rose py-3 font-medium text-white hover:bg-rose-dark disabled:opacity-60">
            {loading ? "Taking you to payment…" : `Pay ${naira(subtotal + DELIVERY_KOBO)}`}
          </button>
          <p className="text-center text-xs text-gray-500">🔒 Secure payment by Paystack</p>
        </aside>
      </form>
    </main>
  );
}
