import Link from "next/link";
import { Tagline } from "@/components/Logo";

export const metadata = { title: "About | TafriTessy" };

export default function About() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <section className="grid items-center gap-8 md:grid-cols-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/wreaths/hero.jpg" alt="A handmade TafriTessy wreath" className="aspect-square w-full rounded-2xl object-cover" />
        <div>
          <Tagline className="text-xs" />
          <h1 className="mt-3 font-serif text-4xl text-forest">Made by hand, made with love</h1>
          <p className="mt-4 text-gray-700">
            TafriTessy makes handcrafted floral wreaths and designs for weddings, birthdays, homes,
            memorials and every season in between. Every piece is put together by hand, so no two
            wreaths are ever exactly alike.
          </p>
          <p className="mt-3 text-gray-700">
            Whether you want a ready-made wreath delivered to your door or something designed just for
            your occasion, we&apos;ll help you find the right flowers, colours and style.
          </p>
        </div>
      </section>

      <section className="mt-14 grid gap-4 text-center sm:grid-cols-3">
        {[
          { icon: "🌿", title: "Handmade", text: "Each wreath is arranged by hand with care and attention to detail." },
          { icon: "🎨", title: "Made for you", text: "Tell us your occasion, colours and budget, and we'll design it with you." },
          { icon: "🚚", title: "Delivered", text: "We deliver across Nigeria and keep you updated by email." },
        ].map((f) => (
          <div key={f.title} className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-3xl">{f.icon}</p>
            <h2 className="mt-2 font-serif text-xl text-forest">{f.title}</h2>
            <p className="mt-1 text-sm text-gray-600">{f.text}</p>
          </div>
        ))}
      </section>

      <section className="mt-14 rounded-2xl bg-forest px-6 py-10 text-center text-white">
        <h2 className="font-serif text-3xl">Let&apos;s create something beautiful</h2>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/shop" className="rounded-full bg-rose px-6 py-3 text-sm font-medium hover:bg-rose-dark">Shop Wreaths</Link>
          <Link href="/book" className="rounded-full border border-white px-6 py-3 text-sm font-medium hover:bg-white/10">Book a Custom Design</Link>
        </div>
      </section>
    </main>
  );
}
