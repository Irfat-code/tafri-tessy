import Link from "next/link";
import { fulfillOrder } from "@/lib/orders";
import { naira, orderCode } from "@/lib/format";
import ClearCart from "./ClearCart";

export const dynamic = "force-dynamic";

// Paystack sends the customer here after paying: /checkout/success?reference=...
export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; trxref?: string }>;
}) {
  const params = await searchParams;
  const reference = params.reference ?? params.trxref;
  const order = reference ? await fulfillOrder(reference) : null;

  if (!order) {
    return (
      <main className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="font-serif text-3xl text-forest">Order not found</h1>
        <p className="mt-2 text-gray-600">We couldn&apos;t find that order. If you were charged, please contact us.</p>
        <Link href="/shop" className="mt-6 inline-block text-rose underline">Back to shop</Link>
      </main>
    );
  }

  if (order.status !== "paid") {
    return (
      <main className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="font-serif text-3xl text-forest">Payment not completed</h1>
        <p className="mt-2 text-gray-600">
          Your payment for order #{orderCode(order.order_no)} didn&apos;t go through. Nothing was charged.
        </p>
        <Link href="/cart" className="mt-6 inline-block rounded-full bg-rose px-7 py-3 text-sm font-medium text-white hover:bg-rose-dark">
          Back to cart
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-20 text-center">
      <ClearCart />
      <p className="text-5xl">🌸</p>
      <h1 className="mt-4 font-serif text-3xl text-forest">Thank you, {order.full_name.split(" ")[0]}!</h1>
      <p className="mt-2 text-gray-600">Your payment was successful.</p>
      <div className="mt-6 rounded-xl bg-white p-6 text-left text-sm shadow-sm">
        <p className="flex justify-between"><span>Order number</span><strong>#{orderCode(order.order_no)}</strong></p>
        <p className="mt-2 flex justify-between"><span>Total paid</span><strong>{naira(order.total_kobo)}</strong></p>
        <p className="mt-2 flex justify-between"><span>Delivering to</span><span>{order.city}, {order.state}</span></p>
      </div>
      <p className="mt-4 text-sm text-gray-600">A confirmation email is on its way to {order.email}.</p>
      <Link href="/shop" className="mt-6 inline-block rounded-full bg-rose px-7 py-3 text-sm font-medium text-white hover:bg-rose-dark">
        Continue Shopping
      </Link>
    </main>
  );
}
