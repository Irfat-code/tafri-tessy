import Link from "next/link";

// "WREATHS • DESIGNS • MORE" with rose dots, as in the brand artwork.
export function Tagline({ className = "" }: { className?: string }) {
  return (
    <span className={`block whitespace-nowrap uppercase tracking-[0.15em] text-forest sm:tracking-[0.25em] ${className}`}>
      Wreaths <span className="text-rose">•</span> Designs <span className="text-rose">•</span> More
    </span>
  );
}

export default function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  const img = size === "lg" ? "h-16 w-16" : "h-12 w-12";
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2 leading-tight">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="TafriTessy logo" className={`${img} object-contain`} />
      <span>
        <span className={`font-serif text-forest ${size === "lg" ? "text-3xl" : "text-2xl"}`}>TafriTessy</span>
        <Tagline className="text-[8px] sm:text-[9px]" />
      </span>
    </Link>
  );
}
