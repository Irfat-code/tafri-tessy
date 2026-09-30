// Prices are stored in kobo (₦1 = 100 kobo).
export function naira(kobo: number) {
  return "₦" + (kobo / 100).toLocaleString("en-NG");
}
