import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-5xl">🥀</p>
      <h1 className="mt-4 font-serif text-3xl text-forest">Page not found</h1>
      <p className="mt-2 text-gray-600">This page doesn&apos;t exist, or the wreath may have been removed.</p>
      <Link href="/shop" className="mt-6 inline-block rounded-full bg-rose px-7 py-3 text-sm font-medium text-white hover:bg-rose-dark">
        Browse Wreaths
      </Link>
    </main>
  );
}
