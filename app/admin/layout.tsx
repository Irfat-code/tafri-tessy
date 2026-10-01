import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

export const metadata = { title: "Admin | TafriTessy" };

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/wreaths", label: "Wreaths" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl text-forest">Admin Dashboard</h1>
        <nav className="flex flex-wrap gap-2">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href}
              className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm hover:border-rose">
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-6">{children}</div>
    </main>
  );
}
