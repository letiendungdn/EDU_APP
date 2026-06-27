import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@edu/vocab-images'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.jsdelivr.net',
        pathname: '/gh/hfg-gmuend/openmoji/**',
      },
    ],
  },
};

export default nextConfig;
