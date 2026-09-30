"use client";

import { useState } from "react";
import Link from "next/link";
import { BUDGETS, MAX_PHOTO_BYTES, OCCASIONS, WREATH_TYPES } from "@/lib/booking";

const input = "mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-rose focus:outline-none";

export default function BookingForm({ defaultName, defaultEmail }: { defaultName: string; defaultEmail: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  // Earliest date is tomorrow.
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setError("");
    if (!file) return setPreview(null);
    if (file.size > MAX_PHOTO_BYTES) {
      setError("Photo must be smaller than 4MB.");
      e.target.value = "";
      return setPreview(null);
    }
    setPreview(URL.createObjectURL(file));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/bookings", { method: "POST", body: new FormData(e.currentTarget) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setStatus("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-xl bg-white p-10 text-center shadow-sm">
        <p className="text-5xl">💐</p>
        <h2 className="mt-4 font-serif text-2xl text-forest">Request received!</h2>
        <p className="mt-2 text-gray-600">
          Thank you. We&apos;ll review your idea and reply within 24–48 hours with a quote.
          A confirmation has been sent to your email.
        </p>
        <Link href="/shop" className="mt-6 inline-block rounded-full bg-rose px-7 py-3 text-sm font-medium text-white hover:bg-rose-dark">
          Browse ready-made wreaths
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 rounded-xl bg-white p-6 shadow-sm md:p-8">
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 font-serif text-xl text-forest">Your details</legend>
        <label className="text-sm sm:col-span-2">Full name *
          <input name="full_name" required defaultValue={defaultName} className={input} autoComplete="name" />
        </label>
        <label className="text-sm">Email *
          <input name="email" type="email" required defaultValue={defaultEmail} className={input} autoComplete="email" />
        </label>
        <label className="text-sm">Phone / WhatsApp *
          <input name="phone" type="tel" required className={input} placeholder="0801 234 5678" autoComplete="tel" />
        </label>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 font-serif text-xl text-forest">Your wreath</legend>
        <label className="text-sm">Occasion *
          <select name="occasion" required defaultValue="" className={input}>
            <option value="" disabled>Choose an occasion</option>
            {OCCASIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </label>
        <label className="text-sm">Date needed
          <input name="preferred_date" type="date" min={tomorrow} className={input} />
        </label>
        <label className="text-sm">Wreath type
          <select name="wreath_type" defaultValue="" className={input}>
            <option value="">Choose a type</option>
            {WREATH_TYPES.map((o) => <option key={o}>{o}</option>)}
          </select>
        </label>
        <label className="text-sm">Budget
          <select name="budget" defaultValue="" className={input}>
            <option value="">Choose a budget</option>
            {BUDGETS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </label>
        <label className="text-sm sm:col-span-2">Preferred colours
          <input name="colours" className={input} placeholder="e.g. blush pink, white and gold" />
        </label>
        <label className="text-sm sm:col-span-2">Tell us about your idea
          <textarea name="description" rows={4} maxLength={2000} className={input}
            placeholder="Size, flowers you love, where it will hang, any message or ribbon…" />
        </label>
        <label className="text-sm sm:col-span-2">Inspiration photo (optional, max 4MB)
          <input name="inspiration" type="file" accept="image/jpeg,image/png,image/webp" onChange={onPhoto}
            className="mt-1 block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-cream file:px-4 file:py-2 file:text-rose" />
        </label>
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Your inspiration" className="h-40 w-40 rounded-lg object-cover" />
        )}
      </fieldset>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <button disabled={status === "sending"}
        className="w-full rounded-full bg-rose py-3 font-medium text-white hover:bg-rose-dark disabled:opacity-60">
        {status === "sending" ? "Sending…" : "Send My Request"}
      </button>
      <p className="text-center text-xs text-gray-500">No payment now. We&apos;ll send you a quote first.</p>
    </form>
  );
}
