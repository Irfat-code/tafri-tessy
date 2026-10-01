import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/admin";
import { CATEGORIES } from "@/lib/categories";
import { createProduct, updateProduct } from "../actions";
import PhotoInput from "@/components/admin/PhotoInput";
import SubmitButton from "@/components/admin/SubmitButton";

export const dynamic = "force-dynamic";

const input = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm";

type Product = {
  id: string; name: string; description: string | null; price_kobo: number;
  category: string; image_url: string | null; stock: number; is_available: boolean;
};

function Fields({ p }: { p?: Product }) {
  return (
    <>
      <label className="text-sm sm:col-span-2">Name
        <input name="name" required defaultValue={p?.name} className={input} />
      </label>
      <label className="text-sm">Price (₦)
        <input name="price" type="number" min="1" step="1" required defaultValue={p ? p.price_kobo / 100 : ""} className={input} />
      </label>
      <label className="text-sm">In stock
        <input name="stock" type="number" min="0" step="1" required defaultValue={p?.stock ?? 1} className={input} />
      </label>
      <label className="text-sm">Category
        <select name="category" defaultValue={p?.category ?? "wedding"} className={input}>
          {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
        </select>
      </label>
      <label className="flex items-center gap-2 self-end pb-2 text-sm">
        <input name="is_available" type="checkbox" defaultChecked={p?.is_available ?? true} />
        Show in shop
      </label>
      <label className="text-sm sm:col-span-2">Description
        <textarea name="description" rows={2} defaultValue={p?.description ?? ""} className={input} />
      </label>
      <div className="sm:col-span-2"><PhotoInput current={p?.image_url} /></div>
    </>
  );
}

export default async function AdminWreaths() {
  await requireAdmin();
  const { data } = await supabaseAdmin.from("products").select("*").order("created_at", { ascending: false });
  const products = (data ?? []) as Product[];

  return (
    <div className="space-y-6">
      <details className="rounded-xl bg-white p-5 shadow-sm">
        <summary className="cursor-pointer font-serif text-xl text-forest">+ Add a new wreath</summary>
        <form action={createProduct} className="mt-4 grid gap-3 sm:grid-cols-2">
          <Fields />
          <div className="sm:col-span-2"><SubmitButton>Add wreath</SubmitButton></div>
        </form>
      </details>

      <div className="grid gap-4 md:grid-cols-2">
        {products.map((p) => (
          <details key={p.id} className="rounded-xl bg-white p-4 shadow-sm">
            <summary className="flex cursor-pointer items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image_url ?? "https://placehold.co/100x100"} alt="" className="h-14 w-14 rounded-lg object-cover" />
              <span className="flex-1">
                <span className="block font-medium">{p.name}</span>
                <span className="text-xs text-gray-500">
                  ₦{(p.price_kobo / 100).toLocaleString("en-NG")} · {p.stock === 0 ? "Sold out" : `${p.stock} in stock`}
                  {!p.is_available && " · Hidden"}
                </span>
              </span>
              <span className="text-sm text-rose">Edit</span>
            </summary>
            <form action={updateProduct} className="mt-4 grid gap-3 sm:grid-cols-2">
              <input type="hidden" name="id" value={p.id} />
              <Fields p={p} />
              <div className="sm:col-span-2"><SubmitButton>Save changes</SubmitButton></div>
            </form>
          </details>
        ))}
      </div>
    </div>
  );
}
