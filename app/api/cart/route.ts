import { NextResponse } from "next/server";
import { getRequestUser } from "@/lib/requestUser";
import { clearCart, currentQuantity, readCart, setCartQuantity } from "@/lib/cartServer";

// The signed-in customer's cart, shared by the website and the mobile app.
//   GET                                   -> { items }
//   POST   { productId, quantity }        -> add that many
//   PATCH  { productId, quantity }        -> set the quantity (0 removes)
//   DELETE                                -> empty the cart

async function withUser(req: Request) {
  const user = await getRequestUser(req);
  if (!user) throw Object.assign(new Error("Please sign in."), { status: 401 });
  return user;
}

function fail(err: unknown) {
  const status = (err as { status?: number }).status ?? 400;
  return NextResponse.json({ error: err instanceof Error ? err.message : "Something went wrong." }, { status });
}

async function parse(req: Request) {
  const body = await req.json().catch(() => null);
  const quantity = Number(body?.quantity);
  if (typeof body?.productId !== "string" || !Number.isInteger(quantity) || quantity < 0 || quantity > 99) {
    throw new Error("Invalid cart item.");
  }
  return { productId: body.productId as string, quantity };
}

export async function GET(req: Request) {
  try {
    const user = await withUser(req);
    return NextResponse.json({ items: await readCart(user.id) });
  } catch (err) { return fail(err); }
}

export async function POST(req: Request) {
  try {
    const user = await withUser(req);
    const { productId, quantity } = await parse(req);
    await setCartQuantity(user.id, productId, (await currentQuantity(user.id, productId)) + quantity);
    return NextResponse.json({ items: await readCart(user.id) });
  } catch (err) { return fail(err); }
}

export async function PATCH(req: Request) {
  try {
    const user = await withUser(req);
    const { productId, quantity } = await parse(req);
    await setCartQuantity(user.id, productId, quantity);
    return NextResponse.json({ items: await readCart(user.id) });
  } catch (err) { return fail(err); }
}

export async function DELETE(req: Request) {
  try {
    const user = await withUser(req);
    await clearCart(user.id);
    return NextResponse.json({ items: [] });
  } catch (err) { return fail(err); }
}
