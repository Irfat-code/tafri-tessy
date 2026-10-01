import Link from "next/link";
import Logo from "@/components/Logo";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-rose/10 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-gray-600 md:flex-row">
        <Logo />
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <Link href="/shop" className="hover:text-rose">Shop</Link>
          <Link href="/book" className="hover:text-rose">Custom Wreath</Link>
          <Link href="/about" className="hover:text-rose">About</Link>
          <Link href="/privacy" className="hover:text-rose">Privacy</Link>
          <Link href="/terms" className="hover:text-rose">Terms</Link>
        </div>
        <p>© {new Date().getFullYear()} TafriTessy</p>
      </div>
    </footer>
  );
}
