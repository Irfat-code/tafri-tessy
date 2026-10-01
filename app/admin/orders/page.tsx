import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/admin";
import { naira, orderCode } from "@/lib/format";
import { toggleDelivered } from "../actions";
import SubmitButton from "@/components/admin/SubmitButton";

export const dynamic = "force-dynamic";

const FILTERS = [
  { key: "paid", label: "To deliver" },
  { key: "delivered", label: "Delivered" },
  { key: "all", label: "All paid" },
];

type Order = {
  id: string; order_no: number; status: string; full_name: string; email: string; phone: string;
  address: string; city: string; state: string; total_kobo: number; created_at: string;
  order_items: { quantity: number; unit_price_kobo: number; products: { name: string } | null }[];
};

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireAdmin();
  const { status = "paid" } = await searchParams;
  const active = FILTERS.some((f) => f.key === status) ? status : "paid";

  let query = supabaseAdmin
    .from("orders")
    .select("*, order_items(quantity, unit_price_kobo, products(name))")
    .order("created_at", { ascending: false });
  query = active === "all" ? query.in("status", ["paid", "delivered"]) : query.eq("status", active);
  const orders = ((await query).data ?? []) as unknown as Order[];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <Link key={f.key} href={`/admin/orders?status=${f.key}`}
            className={`rounded-full border px-4 py-1.5 text-sm ${active === f.key ? "border-forest bg-forest text-white" : "border-gray-300 bg-white"}`}>
            {f.label}
          </Link>
        ))}
      </div>

      {orders.length === 0 && <p className="rounded-xl bg-white p-8 text-center text-gray-500 shadow-sm">No orders here.</p>}

      {orders.map((o) => (
        <div key={o.id} className="rounded-xl bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-medium">#{orderCode(o.order_no)} · {naira(o.total_kobo)}</p>
              <p className="text-xs text-gray-500">{new Date(o.created_at).toLocaleString("en-NG")}</p>
            </div>
            <form action={toggleDelivered}>
              <input type="hidden" name="id" value={o.id} />
              {o.status === "paid" ? (
                <SubmitButton>✓ Mark delivered</SubmitButton>
              ) : (
                <SubmitButton className="border border-gray-300 bg-white text-gray-600 hover:bg-cream">Undo delivered</SubmitButton>
              )}
            </form>
          </div>

          <div className="mt-4 grid gap-4 text-sm md:grid-cols-2">
            <div>
              <p className="font-medium text-forest">Wreaths</p>
              {o.order_items.map((i, idx) => (
                <p key={idx}>{i.products?.name ?? "Wreath"} × {i.quantity} — {naira(i.unit_price_kobo * i.quantity)}</p>
              ))}
            </div>
            <div>
              <p className="font-medium text-forest">Deliver to</p>
              <p>{o.full_name}</p>
              <p>{o.address}, {o.city}, {o.state}</p>
              <p>
                <a href={`tel:${o.phone}`} className="text-rose underline">{o.phone}</a> ·{" "}
                <a href={`mailto:${o.email}`} className="text-rose underline">{o.email}</a>
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
