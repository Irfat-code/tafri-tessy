import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets the admin upload wreath photos (they are resized in the browser first).
  experimental: {
    serverActions: { bodySizeLimit: "4mb" },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
