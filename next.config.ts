import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  // Prisma 7 driver adapter — keep the Node `pg` stack out of the bundle.
  serverExternalPackages: ["@prisma/adapter-pg", "pg"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ocunioenergy.com",
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
        pathname: "/photos/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/dyp8gtllq/image/upload/**",
      },
    ],
  },
};

export default nextConfig;
