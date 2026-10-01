"use client";

import { useState } from "react";

// Shrinks big phone photos in the browser (max 1200px JPEG) before upload,
// so they upload fast and load fast on the shop.
export default function PhotoInput({ current }: { current?: string | null }) {
  const [preview, setPreview] = useState<string | null>(current ?? null);
  const [busy, setBusy] = useState(false);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const img = await createImageBitmap(file);
      const scale = Math.min(1, 1200 / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
      if (blob) {
        const small = new File([blob], "wreath.jpg", { type: "image/jpeg" });
        const dt = new DataTransfer();
        dt.items.add(small);
        input.files = dt.files;
        setPreview(URL.createObjectURL(small));
      }
    } catch {
      setPreview(URL.createObjectURL(file)); // fall back to the original file
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="" className="h-16 w-16 rounded-lg object-cover" />
      )}
      <label className="text-sm">
        <span className="block text-gray-600">{busy ? "Preparing photo…" : preview ? "Change photo" : "Photo"}</span>
        <input name="photo" type="file" accept="image/*" onChange={onChange}
          className="mt-1 block text-xs file:mr-2 file:rounded-full file:border-0 file:bg-cream file:px-3 file:py-1.5 file:text-rose" />
      </label>
    </div>
  );
}
