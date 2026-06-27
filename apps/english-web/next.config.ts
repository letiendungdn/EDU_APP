import type { NextConfig } from "next";
import path from "path";

const apiUrl = process.env.API_URL ?? "http://localhost:3000";
const monorepoRoot = path.join(__dirname, "../..");

const nextConfig: NextConfig = {
  outputFileTracingRoot: monorepoRoot,
  turbopack: {
    root: monorepoRoot,
  },
  transpilePackages: ["@edu/vocab-images"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
        pathname: "/gh/hfg-gmuend/openmoji/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/english/:path*`,
      },
    ];
  },
};

export default nextConfig;
