import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { fulfillOrder } from "@/lib/fulfill";
import { orderNumber } from "@/lib/emails";
import { naira } from "@/lib/format";
import ClearCart from "@/components/ClearCart";

const SELECT = "*, order_items(quantity, unit_price_kobo, products(name))";

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let { data: order } = await supabaseAdmin.from("orders").select(SELECT).eq("id", id).single();
  if (!order) notFound();

  // If still pending, ask Paystack directly. This makes payment work on localhost,
  // where Paystack's webhook cannot reach us.
  if (order.status === "pending" && process.env.PAYSTACK_SECRET_KEY) {
    try {
      const v = await fetch(`https://api.paystack.co/transaction/verify/${order.id}`, {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
        cache: "no-store",
      }).then((r) => r.json());
      if (v.status && v.data?.status === "success") {
        await fulfillOrder(order.id, v.data.amount);
        ({ data: order } = await supabaseAdmin.from("orders").select(SELECT).eq("id", id).single());
      }
    } catch (e) {
      console.error("Paystack verify failed", e);
    }
  }

  const paid = order!.status === "paid" || order!.status === "delivered";

  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
        {paid ? (
          <>
            <ClearCart />
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose text-2xl text-white">✓</div>
            <h1 className="mt-4 font-serif text-3xl text-forest">Thank you for your order!</h1>
            <p className="mt-1 text-gray-600">Order #{orderNumber(order!.order_no)}</p>
            <p className="mt-1 text-sm text-gray-500">A confirmation email is on its way to {order!.email}.</p>
          </>
        ) : (
          <>
            <h1 className="font-serif text-3xl text-forest">Payment not completed</h1>
            <p className="mt-2 text-gray-600">We haven&apos;t received your payment for order #{orderNumber(order!.order_no)}. Your cart is still saved.</p>
            <Link href="/cart" className="mt-5 inline-block rounded-full bg-rose px-6 py-3 text-sm font-medium text-white">Back to cart</Link>
          </>
        )}

        <div className="mt-6 space-y-2 border-t pt-5 text-left text-sm">
          {order!.order_items.map((i: any, idx: number) => (
            <div key={idx} className="flex justify-between"><span>{i.products?.name} × {i.quantity}</span><span>{naira(i.unit_price_kobo * i.quantity)}</span></div>
          ))}
          <div className="flex justify-between"><span>Delivery</span><span>{naira(order!.delivery_kobo)}</span></div>
          <div className="flex justify-between text-base font-semibold"><span>Total</span><span>{naira(order!.total_kobo)}</span></div>
        </div>
        {paid && <Link href="/shop" className="mt-6 inline-block text-sm text-rose hover:underline">Continue shopping</Link>}
      </div>
    </main>
  );
}
