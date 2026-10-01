import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/admin";
import { updateBookingStatus } from "../actions";
import SubmitButton from "@/components/admin/SubmitButton";

export const dynamic = "force-dynamic";

const STATUSES = [
  { key: "pending", label: "New" },
  { key: "confirmed", label: "Confirmed" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

// Nigerian numbers like 0801... become 234801... for WhatsApp links.
function whatsapp(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return "https://wa.me/" + (digits.startsWith("0") ? "234" + digits.slice(1) : digits);
}

export default async function AdminBookings({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireAdmin();
  const { status = "pending" } = await searchParams;
  const active = STATUSES.some((s) => s.key === status) ? status : "pending";

  const { data } = await supabaseAdmin.from("bookings").select("*").eq("status", active).order("created_at", { ascending: false });
  const bookings = data ?? [];

  // Private inspiration photos need a short-lived link to view.
  const photos = new Map<string, string>();
  await Promise.all(bookings.filter((b) => b.inspiration_url).map(async (b) => {
    const { data: signed } = await supabaseAdmin.storage.from("inspiration").createSignedUrl(b.inspiration_url, 3600);
    if (signed) photos.set(b.id, signed.signedUrl);
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Link key={s.key} href={`/admin/bookings?status=${s.key}`}
            className={`rounded-full border px-4 py-1.5 text-sm ${active === s.key ? "border-forest bg-forest text-white" : "border-gray-300 bg-white"}`}>
            {s.label}
          </Link>
        ))}
      </div>

      {bookings.length === 0 && <p className="rounded-xl bg-white p-8 text-center text-gray-500 shadow-sm">No bookings here.</p>}

      {bookings.map((b) => (
        <div key={b.id} className="rounded-xl bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-medium">{b.occasion}{b.wreath_type ? ` · ${b.wreath_type}` : ""}</p>
              <p className="text-xs text-gray-500">Requested {new Date(b.created_at).toLocaleDateString("en-NG")}</p>
            </div>
            <form action={updateBookingStatus} className="flex items-center gap-2">
              <input type="hidden" name="id" value={b.id} />
              <select name="status" defaultValue={b.status} className="rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm">
                {STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
              <SubmitButton>Update</SubmitButton>
            </form>
          </div>

          <div className="mt-4 grid gap-4 text-sm md:grid-cols-[1fr_1fr_auto]">
            <div className="space-y-1">
              {b.preferred_date && <p><span className="text-gray-500">Needed by:</span> {new Date(b.preferred_date).toLocaleDateString("en-NG")}</p>}
              {b.budget && <p><span className="text-gray-500">Budget:</span> {b.budget}</p>}
              {b.colours && <p><span className="text-gray-500">Colours:</span> {b.colours}</p>}
              {b.description && <p className="whitespace-pre-line"><span className="text-gray-500">Details:</span> {b.description}</p>}
            </div>
            <div className="space-y-1">
              <p className="font-medium text-forest">{b.full_name}</p>
              <p><a href={`mailto:${b.email}`} className="text-rose underline">{b.email}</a></p>
              <p>
                <a href={`tel:${b.phone}`} className="text-rose underline">{b.phone}</a> ·{" "}
                <a href={whatsapp(b.phone)} target="_blank" rel="noreferrer" className="text-green-700 underline">WhatsApp</a>
              </p>
            </div>
            {photos.get(b.id) && (
              <a href={photos.get(b.id)} target="_blank" rel="noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photos.get(b.id)} alt="Inspiration" className="h-28 w-28 rounded-lg object-cover" />
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
