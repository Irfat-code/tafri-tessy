// Values come from mobile/.env (see .env.example). EXPO_PUBLIC_* are built into the app.
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? "https://tafritessy.vercel.app").replace(/\/$/, "");
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const DELIVERY_KOBO = 500000; // same flat ₦5,000 fee as the website

export const colors = {
  cream: "#fdf4ed",
  rose: "#d9667a",
  roseDark: "#c04f65",
  forest: "#1f4d3a",
  ink: "#2a2a2a",
  grey: "#6b7280",
  line: "#e5e7eb",
  white: "#ffffff",
};
