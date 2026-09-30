import Link from "next/link";
import { createClient } from "@/lib/supabaseServer";
import ProductCard, { Product } from "@/components/ProductCard";

const categories = [
  { key: "all", label: "All" },
  { key: "wedding", label: "Wedding" },
  { key: "birthday", label: "Birthday" },
  { key: "home", label: "Home Decor" },
  { key: "funeral", label: "Funeral" },
  { key: "seasonal", label: "Seasonal" },
];

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const active = categories.some((c) => c.key === category) ? category! : "all";

  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select("id, name, price_kobo, image_url, category")
    .eq("is_available", true)
    .order("created_at", { ascending: true });
  if (active !== "all") query = query.eq("category", active);

  const { data } = await query;
  const products = (data ?? []) as Product[];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-serif text-3xl text-forest">Shop Our Wreaths</h1>
      <p className="mt-1 text-sm text-gray-600">Browse our collection of handcrafted wreaths for every occasion.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {categories.map((c) => (
          <Link key={c.key} href={c.key === "all" ? "/shop" : `/shop?category=${c.key}`}
            className={`rounded-full border px-5 py-2 text-sm ${
              active === c.key ? "border-forest bg-forest text-white" : "border-gray-300 bg-white hover:border-rose"
            }`}>
            {c.label}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="mt-12 text-center text-gray-500">
          No wreaths in this category yet. <Link href="/book" className="text-rose underline">Book a custom one</Link> 🌸
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-3">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </main>
  );
}
