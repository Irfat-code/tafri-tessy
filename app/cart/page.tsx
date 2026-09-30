"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { naira } from "@/lib/format";
import { DELIVERY_KOBO } from "@/lib/config";

export default function CartPage() {
  const { items, subtotal, ready, setQuantity, removeItem } = useCart();

  if (!ready) return <main className="mx-auto max-w-5xl px-4 py-16 text-center text-gray-500">Loading your cart…</main>;

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-20 text-center">
        <h1 className="font-serif text-3xl text-forest">Your cart is empty</h1>
        <p className="mt-2 text-gray-600">Find a wreath you love and it will show up here. 🌸</p>
        <Link href="/shop" className="mt-6 inline-block rounded-full bg-rose px-7 py-3 text-sm font-medium text-white hover:bg-rose-dark">
          Browse Wreaths
        </Link>
      </main>
    );
  }

  const total = subtotal + DELIVERY_KOBO;
  const count = items.reduce((n, i) => n + i.quantity, 0);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-serif text-3xl text-forest">Your Cart ({count})</h1>

      <div className="mt-6 grid gap-8 md:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {items.map((i) => (
            <div key={i.productId} className="flex gap-4 rounded-xl bg-white p-4 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={i.image_url ?? "https://placehold.co/200x200"} alt={i.name} className="h-24 w-24 rounded-lg object-cover" />
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between gap-2">
                  <Link href={`/shop/${i.productId}`} className="font-medium hover:text-rose">{i.name}</Link>
                  <button onClick={() => removeItem(i.productId)} aria-label="Remove" className="text-gray-400 hover:text-red-500">🗑</button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center rounded-lg border border-gray-300 text-sm">
                    <button onClick={() => setQuantity(i.productId, i.quantity - 1)} className="px-3 py-1" aria-label="Decrease">−</button>
                    <span className="w-6 text-center">{i.quantity}</span>
                    <button onClick={() => setQuantity(i.productId, i.quantity + 1)} className="px-3 py-1" aria-label="Increase">+</button>
                  </div>
                  <p className="font-semibold text-forest">{naira(i.price_kobo * i.quantity)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="h-fit space-y-3 rounded-xl bg-white p-5 shadow-sm">
          <h2 className="font-serif text-xl text-forest">Order Summary</h2>
          <div className="flex justify-between text-sm"><span>Subtotal</span><span>{naira(subtotal)}</span></div>
          <div className="flex justify-between text-sm"><span>Delivery</span><span>{naira(DELIVERY_KOBO)}</span></div>
          <div className="flex justify-between border-t pt-3 text-lg font-semibold"><span>Total</span><span>{naira(total)}</span></div>
          <Link href="/checkout" className="block rounded-full bg-rose py-3 text-center font-medium text-white hover:bg-rose-dark">
            Proceed to Checkout
          </Link>
          <Link href="/shop" className="block text-center text-sm text-rose hover:underline">Continue Shopping</Link>
        </aside>
      </div>
    </main>
  );
}
