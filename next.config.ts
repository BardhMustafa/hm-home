import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Admin product/category forms post images through server actions; the
      // Next default is 1MB, which rejects any real photo before the action
      // runs. Images are compressed client-side (~100-400KB each), so this
      // is headroom, not the working size. Vercel still caps request bodies
      // at 4.5MB at the platform level.
      bodySizeLimit: "8mb",
    },
  },

  images: {
    // Supabase Storage CDN — allow both the modern .co and legacy .in TLDs.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.in",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

  // Silence the "multiple lockfiles" warning that appears when Next.js walks
  // up past the project root and finds another package-lock.json. On Vercel
  // this is never an issue — it only affected local dev on this machine.
  // (outputFileTracingRoot is not needed on Vercel.)
  ...(process.env.NODE_ENV === "development" && {
    outputFileTracingRoot: process.cwd(),
  }),
};

export default nextConfig;
