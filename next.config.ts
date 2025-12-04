import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rnryyluyzknrckfaaxqr.supabase.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "data.bmkg.go.id",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.mapbox.com",
        port: "",
        pathname: "/**",
      },
      // --- TAMBAHKAN INI (GOOGLE MAPS) ---
      {
        protocol: "https",
        hostname: "mt1.google.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
