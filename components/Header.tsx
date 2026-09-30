import Link from "next/link";
import { createClient } from "@/lib/supabaseServer";
import CartButton from "@/components/CartButton";

const links = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/book", label: "Custom Wreath" },
  { href: "/about", label: "About" },
];

export default async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const initial = (user?.user_metadata?.full_name ?? user?.email ?? "?")[0].toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-rose/10 bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="leading-tight">
          <span className="font-serif text-2xl text-forest">🌸 TafriTessy</span>
          <span className="block text-[10px] tracking-wide text-gray-500">Wreaths + Designs + More</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-rose">{l.label}</Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <CartButton />
          {user ? (
            <Link href="/account" aria-label="My account"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-forest text-sm font-medium text-white">
              {initial}
            </Link>
          ) : (
            <Link href="/login" className="rounded-full bg-forest px-4 py-2 text-sm font-medium text-white hover:opacity-90">
              Sign In
            </Link>
          )}
          <details className="relative md:hidden">
            <summary className="cursor-pointer list-none text-2xl">☰</summary>
            <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white p-3 shadow-lg">
              {links.map((l) => (
                <Link key={l.href} href={l.href} className="block rounded px-3 py-2 text-sm hover:bg-cream">{l.label}</Link>
              ))}
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
