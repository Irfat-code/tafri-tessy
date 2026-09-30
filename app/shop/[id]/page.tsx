import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";
import { naira } from "@/lib/format";
import AddToCartPanel from "@/components/AddToCartPanel";

const categoryLabels: Record<string, string> = {
  wedding: "Wedding", birthday: "Birthday", home: "Home Decor", funeral: "Funeral", seasonal: "Seasonal",
};

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase.from("products").select("*").eq("id", id).single();
  if (!product) notFound();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/shop" className="text-sm text-gray-600 hover:text-rose">← Back to shop</Link>

      <div className="mt-4 grid gap-8 md:grid-cols-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.image_url ?? "https://placehold.co/800x800"} alt={product.name}
          className="aspect-square w-full rounded-2xl object-cover" />

        <div className="space-y-5">
          <p className="text-sm text-rose">{categoryLabels[product.category] ?? product.category} Collection</p>
          <h1 className="font-serif text-3xl text-forest">{product.name}</h1>
          <p className="text-2xl font-semibold">{naira(product.price_kobo)}</p>
          <p className="text-gray-700">{product.description}</p>
          <p className="text-sm">
            Availability:{" "}
            {product.stock <= 0 ? (
              <span className="font-medium text-red-600">Sold out</span>
            ) : product.stock <= 2 ? (
              <span className="font-medium text-amber-600">Only {product.stock} left</span>
            ) : (
              <span className="font-medium text-green-700">In stock</span>
            )}
          </p>

          <AddToCartPanel product={{ id: product.id, name: product.name, price_kobo: product.price_kobo, stock: product.stock, image_url: product.image_url }} />

          <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs text-gray-600">
            <div className="rounded-lg bg-white p-3">🌿 Handmade with care</div>
            <div className="rounded-lg bg-white p-3">✨ Long lasting & durable</div>
            <div className="rounded-lg bg-white p-3">🚚 Delivery across Nigeria</div>
          </div>

          <div className="divide-y rounded-lg bg-white text-sm">
            <details className="p-4"><summary className="cursor-pointer font-medium">Details</summary>
              <p className="mt-2 text-gray-600">Each wreath is handcrafted, so small variations make every piece unique.</p></details>
            <details className="p-4"><summary className="cursor-pointer font-medium">Care Instructions</summary>
              <p className="mt-2 text-gray-600">Keep away from direct rain and strong sun. Dust gently with a soft brush.</p></details>
            <details className="p-4"><summary className="cursor-pointer font-medium">Shipping & Returns</summary>
              <p className="mt-2 text-gray-600">We confirm delivery details by email after your order. Contact us within 48 hours of delivery if there is an issue.</p></details>
          </div>
        </div>
      </div>
    </main>
  );
}
