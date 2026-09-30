import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-rose/10 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-gray-600 md:flex-row">
        <div className="text-center md:text-left">
          <p className="font-serif text-lg text-forest">🌸 TafriTessy</p>
          <p>Wreaths + Designs + More</p>
        </div>
        <div className="flex gap-6">
          <Link href="/shop" className="hover:text-rose">Shop</Link>
          <Link href="/book" className="hover:text-rose">Custom Wreath</Link>
          <Link href="/about" className="hover:text-rose">About</Link>
        </div>
        <p>© {new Date().getFullYear()} TafriTessy</p>
      </div>
    </footer>
  );
}
