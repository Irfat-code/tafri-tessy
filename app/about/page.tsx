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
          <h1 className="mt-3 font-serif text-3xl text-forest">Made by hand, made with love</h1>
          <p className="mt-4 text-gray-700">
            Welcome to TafriTessy, where flowers become beautiful expressions of love, remembrance,
            celebration and joy.
          </p>
          <p className="mt-3 text-gray-700">
            We create handcrafted wreaths and floral pieces for life&apos;s meaningful moments: funerals and
            memorial tributes, Christmas and festive celebrations, birthdays, anniversaries, weddings,
            housewarmings, thoughtful gifts and everyday décor.
          </p>
          <p className="mt-3 text-gray-700">
            Flowers can express love when words are hard to find, bring comfort in times of loss and add
            warmth to every celebration. That&apos;s why every TafriTessy piece is made with care, creativity
            and attention to detail.
          </p>
          <p className="mt-5 font-serif text-lg italic text-rose">
            Thoughtfully crafted. Beautifully expressed. Made for every meaningful moment.
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
