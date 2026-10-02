import { API_URL } from "./config";

export function naira(kobo: number) {
  return "₦" + Math.round(kobo / 100).toLocaleString("en-NG");
}

export function orderCode(orderNo: number) {
  return "TT" + (1000 + orderNo);
}

// The website stores some photos as "/wreaths/rose.jpg"; the app needs the full address.
export function imageUrl(url: string | null) {
  if (!url) return "https://placehold.co/600x600/fdf4ed/1f4d3a?text=TafriTessy";
  return url.startsWith("/") ? API_URL + url : url;
}
