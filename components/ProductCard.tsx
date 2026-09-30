import Link from "next/link";
import { naira } from "@/lib/format";

export type Product = {
  id: string;
  name: string;
  price_kobo: number;
  image_url: string | null;
  category: string;
};

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md">
      <Link href={`/shop/${product.id}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.image_url ?? "https://placehold.co/600x600"} alt={product.name}
          className="aspect-square w-full object-cover" />
      </Link>
      <div className="p-4">
        <h3 className="font-medium">{product.name}</h3>
        <p className="mt-1 font-semibold text-forest">{naira(product.price_kobo)}</p>
        <Link href={`/shop/${product.id}`}
          className="mt-3 block rounded-full bg-rose py-2 text-center text-sm font-medium text-white hover:bg-rose-dark">
          View
        </Link>
      </div>
    </div>
  );
}
