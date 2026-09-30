"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";

export default function CartButton() {
  const { count, ready } = useCart();
  return (
    <Link href="/cart" aria-label="Cart" className="relative text-xl hover:text-rose">
      🛒
      {ready && count > 0 && (
        <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose px-1 text-[11px] font-medium text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
