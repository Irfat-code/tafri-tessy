import Link from "next/link";
import { createClient } from "@/lib/supabaseServer";
import ProductCard, { Product } from "@/components/ProductCard";

const occasions = [
  { label: "Wedding", key: "wedding", color: "f4d6d6" },
  { label: "Birthday", key: "birthday", color: "f7e3a1" },
  { label: "Home Decor", key: "home", color: "dcd2ee" },
  { label: "Funeral", key: "funeral", color: "e4e4e4" },
  { label: "Seasonal", key: "seasonal", color: "f0c9a0" },
  { label: "Custom", key: "custom", color: "c9e2c9" },
];

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id, name, price_kobo, image_url, category")
    .eq("is_available", true)
    .order("created_at", { ascending: true })
    .limit(4);
  const featured = (data ?? []) as Product[];

  return (
    <main className="mx-auto max-w-6xl space-y-14 px-4 py-6">
      {/* Hero */}
      <section className="grid overflow-hidden rounded-2xl bg-forest text-white md:grid-cols-2">
        <div className="flex flex-col justify-center gap-5 p-8 md:p-12">
          <h1 className="font-serif text-4xl leading-tight md:text-5xl">Beautiful Wreaths, Made with Love</h1>
          <p className="text-white/85">Handcrafted floral designs for every occasion, from celebrations to everyday moments.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/shop" className="rounded-full bg-rose px-6 py-3 text-sm font-medium hover:bg-rose-dark">Shop Ready-Made</Link>
            <Link href="/book" className="rounded-full border border-white px-6 py-3 text-sm font-medium hover:bg-white/10">Book a Custom Design</Link>
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://placehold.co/800x600/f4d6d6/1f4d3a?text=Hero+Wreath+Photo" alt="Featured wreath"
          className="h-64 w-full object-cover md:h-full" />
      </section>

      {/* Shop by occasion */}
      <section>
        <h2 className="mb-5 font-serif text-2xl text-forest">Shop by Occasion</h2>
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
          {occasions.map((o) => (
            <Link key={o.key} href={o.key === "custom" ? "/book" : `/shop?category=${o.key}`} className="group text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`https://placehold.co/200x200/${o.color}/333?text=${encodeURIComponent(o.label)}`} alt={o.label}
                className="mx-auto aspect-square w-full max-w-[110px] rounded-full object-cover ring-2 ring-transparent group-hover:ring-rose" />
              <span className="mt-2 block text-sm">{o.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section>
        <div className="mb-5 flex items-end justify-between">
          <h2 className="font-serif text-2xl text-forest">Featured Wreaths</h2>
          <Link href="/shop" className="text-sm text-rose hover:underline">View All →</Link>
        </div>
        {featured.length === 0 ? (
          <p className="text-gray-500">No wreaths yet. Check back soon. 🌸</p>
        ) : (
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* Custom CTA */}
      <section className="rounded-2xl bg-forest px-6 py-12 text-center text-white">
        <h2 className="font-serif text-3xl">Need Something Custom?</h2>
        <p className="mx-auto mt-2 max-w-md text-white/85">Tell us what you have in mind and we&apos;ll bring it to life.</p>
        <Link href="/book" className="mt-6 inline-block rounded-full bg-white px-7 py-3 text-sm font-medium text-forest hover:bg-cream">
          Book a Consultation
        </Link>
      </section>
    </main>
  );
}
