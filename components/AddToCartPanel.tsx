"use client";

import { useState } from "react";

type Props = { product: { id: string; name: string; price_kobo: number; stock: number } };

// Step 5 replaces the button actions with real cart logic.
export default function AddToCartPanel({ product }: Props) {
  const [qty, setQty] = useState(1);
  const soldOut = product.stock <= 0;

  if (soldOut) {
    return <p className="rounded-lg bg-gray-100 p-4 text-center text-gray-600">Sold out. Want something similar? Book a custom wreath.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <div className="flex items-center rounded-lg border border-gray-300">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-4 py-2 text-lg" aria-label="Decrease">−</button>
          <span className="w-8 text-center">{qty}</span>
          <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="px-4 py-2 text-lg" aria-label="Increase">+</button>
        </div>
        <button onClick={() => alert("Cart is added in Step 5")}
          className="flex-1 rounded-full bg-rose py-3 font-medium text-white hover:bg-rose-dark">
          Add to Cart
        </button>
      </div>
      <button onClick={() => alert("Buy Now is added in Step 5")}
        className="w-full rounded-full bg-forest py-3 font-medium text-white hover:opacity-90">
        Buy Now
      </button>
    </div>
  );
}
