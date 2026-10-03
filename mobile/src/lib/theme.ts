import { Platform } from "react-native";

// Same palette as the website (app/globals.css).
export const colors = {
  cream: "#fdf4ed",
  rose: "#d9667a",
  roseDark: "#c04f65",
  forest: "#1f4d3a",
  ink: "#2a2a2a",
  white: "#ffffff",
  muted: "#6b7280",
  border: "#e5e7eb",
  danger: "#b91c1c",
  dangerBg: "#fef2f2",
  success: "#15803d",
  amber: "#d97706",
  whatsapp: "#25D366",
};

// The website uses Georgia for headings.
export const serif = Platform.select({ ios: "Georgia", default: "serif" });

export const radius = { sm: 8, md: 12, lg: 16, pill: 999 };

export const shadow = {
  shadowColor: "#000",
  shadowOpacity: 0.06,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
};
