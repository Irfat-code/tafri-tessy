// Prices are stored in kobo (₦1 = 100 kobo).
export function naira(kobo: number) {
  return "₦" + (kobo / 100).toLocaleString("en-NG");
}

// Order number shown to customers, e.g. #TT1001.
export function orderCode(orderNo: number) {
  return "TT" + (1000 + orderNo);
}
