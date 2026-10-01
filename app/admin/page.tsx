import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/admin";
import { naira, orderCode } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  await requireAdmin();
  const [{ data: orders }, { count: pendingBookings }, { data: lowStock }] = await Promise.all([
    supabaseAdmin.from("orders").select("id, order_no, full_name, status, total_kobo, created_at")
      .in("status", ["paid", "delivered"]).order("created_at", { ascending: false }),
    supabaseAdmin.from("bookings").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabaseAdmin.from("products").select("id, name, stock").eq("is_available", true).lte("stock", 1).order("stock"),
  ]);

  const all = orders ?? [];
  const revenue = all.reduce((n, o) => n + o.total_kobo, 0);
  const toDeliver = all.filter((o) => o.status === "paid").length;

  const stats = [
    { label: "Total sales", value: naira(revenue), href: "/admin/orders?status=all" },
    { label: "Orders to deliver", value: toDeliver, href: "/admin/orders" },
    { label: "New booking requests", value: pendingBookings ?? 0, href: "/admin/bookings" },
    { label: "Wreaths low on stock", value: lowStock?.length ?? 0, href: "/admin/wreaths" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-xl bg-white p-5 shadow-sm hover:shadow-md">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="mt-1 text-2xl font-semibold text-forest">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="font-serif text-xl text-forest">Latest orders</h2>
          {all.length === 0 ? <p className="mt-3 text-sm text-gray-500">No paid orders yet.</p> : (
            <ul className="mt-3 divide-y text-sm">
              {all.slice(0, 5).map((o) => (
                <li key={o.id} className="flex justify-between py-2">
                  <span>#{orderCode(o.order_no)} · {o.full_name}</span>
                  <span className={o.status === "paid" ? "text-amber-700" : "text-green-700"}>
                    {naira(o.total_kobo)} · {o.status === "paid" ? "to deliver" : "delivered"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="font-serif text-xl text-forest">Low stock</h2>
          {!lowStock?.length ? <p className="mt-3 text-sm text-gray-500">All wreaths are well stocked.</p> : (
            <ul className="mt-3 divide-y text-sm">
              {lowStock.map((p) => (
                <li key={p.id} className="flex justify-between py-2">
                  <span>{p.name}</span>
                  <span className={p.stock === 0 ? "text-red-600" : "text-amber-700"}>{p.stock === 0 ? "Sold out" : "1 left"}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
