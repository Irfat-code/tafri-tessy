// Same helpers as the website's lib/format.ts.

// Prices are stored in kobo (₦1 = 100 kobo).
export function naira(kobo: number) {
  return "₦" + Math.round(kobo / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Order number shown to customers, e.g. #TT1001.
export function orderCode(orderNo: number) {
  return "TT" + (1000 + orderNo);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// "3 Oct 2026"
export function shortDate(value: string | Date) {
  const d = typeof value === "string" ? new Date(value) : value;
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

// "2026-10-03" in local time, the format the bookings API expects.
export function isoDate(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
