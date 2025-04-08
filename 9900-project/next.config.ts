import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "source.unsplash.com", 
      "as1.ftcdn.net",
      "t3.ftcdn.net",
      "ftcdn.net",
      "images.unsplash.com",
      "plus.unsplash.com"
    ], // Allow external image domains
  },
};

export default nextConfig;
