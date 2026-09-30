// Server only. Talks to Paystack with the secret key.
const PAYSTACK_API = "https://api.paystack.co";

async function paystack<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(PAYSTACK_API + path, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  const json = await res.json();
  if (!res.ok || !json.status) throw new Error(json.message ?? `Paystack error ${res.status}`);
  return json.data as T;
}

export function initializeTransaction(args: {
  email: string;
  amount: number; // kobo
  reference: string;
  callback_url: string;
  metadata?: Record<string, unknown>;
}) {
  return paystack<{ authorization_url: string; reference: string }>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({ ...args, currency: "NGN" }),
  });
}

export function verifyTransaction(reference: string) {
  return paystack<{ status: string; amount: number; currency: string; reference: string }>(
    `/transaction/verify/${encodeURIComponent(reference)}`
  );
}
