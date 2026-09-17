import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  // Prisma 7 driver adapter — keep the Node `pg` stack out of the bundle.
  serverExternalPackages: ["@prisma/adapter-pg", "pg"],
  images: {
    // Product & blog images are admin-entered URLs (the admin area is
    // `requireAdmin`-gated). The Next image optimizer is the only thing that
    // fetches these, so allow any HTTPS host rather than maintaining a list.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    // /api/media/[...key] already serves its content-addressed uploads/<uuid>
    // bytes as `immutable, max-age=31536000` — match the optimizer's own
    // cache TTL to that instead of the 60s default.
    minimumCacheTTL: 31536000,
  },
};

export default nextConfig;
