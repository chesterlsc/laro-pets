import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: { formats: ['image/webp'] },
  async redirects() {
    return [];
  },
};

export default nextConfig;
