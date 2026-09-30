"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart";

export default function ClearCart() {
  const { clear, ready } = useCart();
  useEffect(() => { if (ready) clear(); }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
