import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "source.unsplash.com", 
      "as1.ftcdn.net",
      "ftcdn.net",
      "images.unsplash.com",
      "plus.unsplash.com",
      "localhost"
    ],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5004',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;
