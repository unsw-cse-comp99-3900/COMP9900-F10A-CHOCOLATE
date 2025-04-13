import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "source.unsplash.com", 
      "as1.ftcdn.net",
      "t3.ftcdn.net",
      "ftcdn.net",
      "images.unsplash.com",
      "plus.unsplash.com",
      "placehold.co",
      "placehold.jp",
      "placekitten.com",
      "picsum.photos",
      "dummyimage.com",
      "via.placeholder.com",
      "localhost",
      "127.0.0.1"
    ],
    unoptimized: true
  },
};

export default nextConfig;
