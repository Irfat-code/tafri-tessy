import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";
import { naira, orderCode } from "@/lib/format";
import SaveButton from "@/components/SaveButton";

const TABS = [
  { key: "orders", label: "My Orders" },
  { key: "bookings", label: "My Bookings" },
  { key: "saved", label: "Saved Items" },
] as const;
type Tab = (typeof TABS)[number]["key"];

const ORDER_STATUS: Record<string, { label: string; className: string }> = {
  paid: { label: "Paid · Preparing", className: "bg-amber-100 text-amber-800" },
  delivered: { label: "Delivered", className: "bg-green-100 text-green-800" },
};
const BOOKING_STATUS: Record<string, { label: string; className: string }> = {
  pending: { label: "Awaiting quote", className: "bg-amber-100 text-amber-800" },
  confirmed: { label: "Confirmed", className: "bg-blue-100 text-blue-800" },
  completed: { label: "Completed", className: "bg-green-100 text-green-800" },
  cancelled: { label: "Cancelled", className: "bg-gray-100 text-gray-600" },
};

function Badge({ status, map }: { status: string; map: Record<string, { label: string; className: string }> }) {
  const s = map[status] ?? { label: status, className: "bg-gray-100 text-gray-600" };
  return <span className={`rounded-full px-3 py-1 text-xs font-medium ${s.className}`}>{s.label}</span>;
}

function date(value: string) {
  return new Date(value).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

function Empty({ text, href, cta }: { text: string; href: string; cta: string }) {
  return (
    <div className="rounded-xl bg-white p-10 text-center shadow-sm">
      <p className="text-gray-600">{text}</p>
      <Link href={href} className="mt-4 inline-block rounded-full bg-rose px-6 py-2.5 text-sm font-medium text-white hover:bg-rose-dark">{cta}</Link>
    </div>
  );
}

type OrderRow = {
  id: string; order_no: number; status: string; total_kobo: number; created_at: string; city: string; state: string;
  order_items: { quantity: number; unit_price_kobo: number; products: { name: string; image_url: string | null } | null }[];
};
type BookingRow = {
  id: string; occasion: string; wreath_type: string | null; preferred_date: string | null;
  budget: string | null; status: string; created_at: string;
};
type SavedRow = { products: { id: string; name: string; price_kobo: number; image_url: string | null; stock: number } | null };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { tab: rawTab } = await searchParams;
  const tab: Tab = TABS.some((t) => t.key === rawTab) ? (rawTab as Tab) : "orders";

  const { data: profile } = await supabase.from("profiles").select("full_name, email, avatar_url").eq("id", user.id).single();

  // Only paid or delivered orders; abandoned payments stay hidden.
  const [ordersRes, bookingsRes, savedRes] = await Promise.all([
    supabase.from("orders")
      .select("id, order_no, status, total_kobo, created_at, city, state, order_items(quantity, unit_price_kobo, products(name, image_url))")
      .eq("user_id", user.id).in("status", ["paid", "delivered"]).order("created_at", { ascending: false }),
    supabase.from("bookings")
      .select("id, occasion, wreath_type, preferred_date, budget, status, created_at")
      .eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("favorites")
      .select("products(id, name, price_kobo, image_url, stock)")
      .eq("user_id", user.id),
  ]);

  // Supabase can't infer the joined shapes, so name them here.
  const orders = (ordersRes.data ?? []) as unknown as OrderRow[];
  const bookings = (bookingsRes.data ?? []) as BookingRow[];
  const saved = ((savedRes.data ?? []) as unknown as SavedRow[]).flatMap((s) => (s.products ? [s.products] : []));

  const counts: Record<Tab, number> = {
    orders: orders.length,
    bookings: bookings.length,
    saved: saved.length,
  };
  const name = profile?.full_name ?? user.user_metadata?.full_name ?? "friend";

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt="" referrerPolicy="no-referrer" className="h-14 w-14 rounded-full object-cover" />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-forest text-xl text-white">{name[0]?.toUpperCase()}</div>
          )}
          <div>
            <h1 className="font-serif text-2xl text-forest">Hello, {name.split(" ")[0]}!</h1>
            <p className="text-sm text-gray-600">{profile?.email ?? user.email}</p>
          </div>
        </div>
        <form action="/auth/signout" method="post">
          <button className="rounded-full border border-gray-300 px-5 py-2 text-sm hover:bg-cream">Log out</button>
        </form>
      </div>

      <nav className="mt-6 flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <Link key={t.key} href={`/account?tab=${t.key}`}
            className={`whitespace-nowrap rounded-full border px-5 py-2 text-sm ${
              tab === t.key ? "border-forest bg-forest text-white" : "border-gray-300 bg-white hover:border-rose"
            }`}>
            {t.label} ({counts[t.key]})
          </Link>
        ))}
      </nav>

      <section className="mt-6 space-y-4">
        {tab === "orders" && (
          orders.length ? orders.map((o) => (
            <div key={o.id} className="rounded-xl bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">Order #{orderCode(o.order_no)}</p>
                  <p className="text-xs text-gray-500">{date(o.created_at)} · Delivering to {o.city}, {o.state}</p>
                </div>
                <Badge status={o.status} map={ORDER_STATUS} />
              </div>
              <div className="mt-4 space-y-2">
                {o.order_items.map((i, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={i.products?.image_url ?? "https://placehold.co/100x100"} alt="" className="h-12 w-12 rounded object-cover" />
                    <span className="flex-1">{i.products?.name ?? "Wreath"} × {i.quantity}</span>
                    <span>{naira(i.unit_price_kobo * i.quantity)}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 border-t pt-3 text-right font-semibold text-forest">Total {naira(o.total_kobo)}</p>
            </div>
          )) : <Empty text="You haven't ordered any wreaths yet." href="/shop" cta="Shop Wreaths" />
        )}

        {tab === "bookings" && (
          bookings.length ? bookings.map((b) => (
            <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-5 shadow-sm">
              <div>
                <p className="font-medium">{b.occasion}{b.wreath_type ? ` · ${b.wreath_type}` : ""}</p>
                <p className="text-xs text-gray-500">
                  Requested {date(b.created_at)}
                  {b.preferred_date ? ` · Needed by ${date(b.preferred_date)}` : ""}
                  {b.budget ? ` · ${b.budget}` : ""}
                </p>
              </div>
              <Badge status={b.status} map={BOOKING_STATUS} />
            </div>
          )) : <Empty text="No custom wreath requests yet." href="/book" cta="Book a Custom Wreath" />
        )}

        {tab === "saved" && (
          saved.length ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {saved.map((p) => (
                <div key={p.id} className="overflow-hidden rounded-xl bg-white shadow-sm">
                  <Link href={`/shop/${p.id}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image_url ?? "https://placehold.co/600x600"} alt={p.name} className="aspect-square w-full object-cover" />
                  </Link>
                  <div className="p-3">
                    <Link href={`/shop/${p.id}`} className="text-sm font-medium hover:text-rose">{p.name}</Link>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-sm font-semibold text-forest">{p.stock > 0 ? naira(p.price_kobo) : "Sold out"}</span>
                      <SaveButton productId={p.id} userId={user.id} initialSaved compact />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : <Empty text="Tap “Save for later” on any wreath to keep it here." href="/shop" cta="Browse Wreaths" />
        )}
      </section>
    </main>
  );
}
