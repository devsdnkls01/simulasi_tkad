import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  async rewrites() {
    return [
      {
        source: '/exam/:file([0-9]{4,6}_[a-f0-9]{32}\\.png)',
        destination: '/soal-images/:file',
      },
      {
        source: '/exam/:id/:file([0-9]{4,6}_[a-f0-9]{32}\\.png)',
        destination: '/soal-images/:file',
      },
    ];
  },
};

export default nextConfig;
