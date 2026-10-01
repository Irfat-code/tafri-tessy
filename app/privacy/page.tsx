export const metadata = { title: "Privacy Policy | TafriTessy" };

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-serif text-4xl text-forest">Privacy Policy</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: October 2026</p>

      <div className="mt-8 space-y-6 text-gray-700 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:text-forest">
        <p>
          TafriTessy (&ldquo;we&rdquo;, &ldquo;us&rdquo;) sells handmade wreaths and takes custom wreath bookings.
          This policy explains what information we collect and how we use it.
        </p>

        <section>
          <h2>What we collect</h2>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li><strong>Google sign-in:</strong> your name, email address and profile picture, so you can see your orders, bookings and saved items.</li>
            <li><strong>Orders:</strong> your name, email, phone number and delivery address, and the wreaths you buy.</li>
            <li><strong>Custom bookings:</strong> the details you enter in the booking form and any inspiration photo you upload.</li>
          </ul>
        </section>

        <section>
          <h2>Payments</h2>
          <p>Payments are handled by Paystack. We never see or store your card details.</p>
        </section>

        <section>
          <h2>How we use your information</h2>
          <p>
            Only to process your orders and bookings, deliver your wreaths, and send you order and booking
            emails. We do not sell your information or use it for advertising.
          </p>
        </section>

        <section>
          <h2>Who we share it with</h2>
          <p>
            Only the services that run this website: Supabase (secure database and sign-in), Paystack
            (payments), Mailgun (emails) and Vercel (hosting).
          </p>
        </section>

        <section>
          <h2>Your choices</h2>
          <p>
            You can ask us to correct or delete your information at any time by replying to any email from us.
            You can also remove TafriTessy&apos;s access to your Google account in your Google account settings.
          </p>
        </section>
      </div>
    </main>
  );
}
