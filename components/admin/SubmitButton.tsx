"use client";

import { useFormStatus } from "react-dom";

export default function SubmitButton({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending}
      className={`rounded-full px-4 py-2 text-sm font-medium disabled:opacity-50 ${className || "bg-forest text-white hover:opacity-90"}`}>
      {pending ? "Saving…" : children}
    </button>
  );
}
