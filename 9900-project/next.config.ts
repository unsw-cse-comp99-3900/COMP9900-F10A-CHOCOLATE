import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["source.unsplash.com", "localhost"], // 允许 Unsplash 和本地图片
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

module.exports = {
  images: {
    domains: ["source.unsplash.com"], // 允许 Unsplash 图片
  },
};
