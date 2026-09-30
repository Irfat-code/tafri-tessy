"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";

type Props = {
  product: { id: string; name: string; price_kobo: number; stock: number; image_url: string | null };
};

export default function AddToCartPanel({ product }: Props) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const router = useRouter();
  const soldOut = product.stock <= 0;

  if (soldOut) {
    return (
      <p className="rounded-lg bg-gray-100 p-4 text-center text-gray-600">
        Sold out. Want something similar?{" "}
        <Link href="/book" className="text-rose underline">Book a custom wreath</Link>.
      </p>
    );
  }

  const item = {
    productId: product.id,
    name: product.name,
    price_kobo: product.price_kobo,
    image_url: product.image_url,
    stock: product.stock,
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <div className="flex items-center rounded-lg border border-gray-300">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-4 py-2 text-lg" aria-label="Decrease">−</button>
          <span className="w-8 text-center">{qty}</span>
          <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="px-4 py-2 text-lg" aria-label="Increase">+</button>
        </div>
        <button
          onClick={() => { addItem(item, qty); setAdded(true); }}
          className="flex-1 rounded-full bg-rose py-3 font-medium text-white hover:bg-rose-dark">
          Add to Cart
        </button>
      </div>
      <button
        onClick={() => { addItem(item, qty); router.push("/checkout"); }}
        className="w-full rounded-full bg-forest py-3 font-medium text-white hover:opacity-90">
        Buy Now
      </button>
      {added && (
        <p className="text-center text-sm text-green-700">
          ✓ Added to your cart. <Link href="/cart" className="underline">View cart</Link>
        </p>
      )}
    </div>
  );
}
