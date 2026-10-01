import { createClient } from "@/lib/supabaseServer";
import BookingForm from "@/components/BookingForm";
import WhatsAppButton, { whatsappLink } from "@/components/WhatsAppButton";

export const metadata = { title: "Book a Custom Wreath | TafriTessy" };

export default async function BookPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 text-center">
        <p className="text-sm text-rose">Made just for you</p>
        <h1 className="font-serif text-4xl text-forest">Book a Custom Wreath</h1>
        <p className="mx-auto mt-3 max-w-xl text-gray-600">
          Tell us about your occasion, colours and style, and we&apos;ll design a wreath that&apos;s uniquely yours.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-3 gap-3 text-center text-xs text-gray-600">
        <div className="rounded-lg bg-white p-3"><strong className="block text-forest">1. Share your idea</strong>Fill in the form below</div>
        <div className="rounded-lg bg-white p-3"><strong className="block text-forest">2. Get a quote</strong>We reply in 24–48 hours</div>
        <div className="rounded-lg bg-white p-3"><strong className="block text-forest">3. We create it</strong>Handmade with love</div>
      </div>

      {whatsappLink() && (
        <div className="mb-8 flex flex-col items-center gap-3 rounded-xl bg-white p-5 text-center shadow-sm sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="font-medium text-forest">Prefer to talk it through?</p>
            <p className="text-sm text-gray-600">Chat with us on WhatsApp for a quick consultation, or fill in the form below.</p>
          </div>
          <WhatsAppButton className="shrink-0" />
        </div>
      )}

      <BookingForm
        defaultName={user?.user_metadata?.full_name ?? ""}
        defaultEmail={user?.email ?? ""}
      />
    </main>
  );
}
