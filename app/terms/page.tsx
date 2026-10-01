export const metadata = { title: "Terms of Service | TafriTessy" };

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-serif text-4xl text-forest">Terms of Service</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: October 2026</p>

      <div className="mt-8 space-y-6 text-gray-700 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:text-forest">
        <p>By using this website or placing an order with TafriTessy, you agree to these terms.</p>

        <section>
          <h2>Our wreaths</h2>
          <p>
            Every wreath is handmade, so small differences in colour, flowers and size from the photos are normal
            and part of what makes each piece unique.
          </p>
        </section>

        <section>
          <h2>Orders and payment</h2>
          <p>
            Prices are in Naira (₦) and include the delivery fee shown at checkout. Your order is confirmed once
            payment through Paystack succeeds and you receive a confirmation email.
          </p>
        </section>

        <section>
          <h2>Custom bookings</h2>
          <p>
            Sending a custom booking request is free and does not commit you to buy. We will reply with a quote,
            and work starts only after you accept it.
          </p>
        </section>

        <section>
          <h2>Delivery</h2>
          <p>We deliver across Nigeria and will contact you by email or phone to arrange delivery.</p>
        </section>

        <section>
          <h2>Problems with your order</h2>
          <p>
            If your wreath arrives damaged or something is wrong, contact us within 48 hours of delivery by
            replying to your order email, and we will make it right.
          </p>
        </section>
      </div>
    </main>
  );
}
