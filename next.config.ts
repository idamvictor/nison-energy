import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ocunioenergy.com",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
};

export default nextConfig;
