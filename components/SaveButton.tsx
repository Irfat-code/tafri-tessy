"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseBrowser";

// Heart button that adds or removes a wreath from the customer's Saved list.
export default function SaveButton({
  productId,
  userId,
  initialSaved,
  compact = false,
}: {
  productId: string;
  userId: string | null;
  initialSaved: boolean;
  compact?: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function toggle() {
    if (!userId) return router.push("/login");
    setBusy(true);
    const supabase = createClient();
    const { error } = saved
      ? await supabase.from("favorites").delete().eq("user_id", userId).eq("product_id", productId)
      : await supabase.from("favorites").insert({ user_id: userId, product_id: productId });
    setBusy(false);
    if (error) return alert("Could not update your saved items. Please try again.");
    setSaved(!saved);
    router.refresh();
  }

  if (compact) {
    return (
      <button onClick={toggle} disabled={busy} className="text-sm text-gray-500 hover:text-red-500 disabled:opacity-50">
        {saved ? "Remove" : "Save"}
      </button>
    );
  }

  return (
    <button onClick={toggle} disabled={busy}
      className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white py-3 text-sm font-medium hover:border-rose disabled:opacity-50">
      <span className={saved ? "text-rose" : "text-gray-400"}>{saved ? "♥" : "♡"}</span>
      {saved ? "Saved to your wishlist" : userId ? "Save for later" : "Sign in to save"}
    </button>
  );
}
