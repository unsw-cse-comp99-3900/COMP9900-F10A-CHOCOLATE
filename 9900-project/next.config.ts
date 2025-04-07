import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      "source.unsplash.com",  // Allow Unsplash images
      "as1.ftcdn.net",        // Allow Adobe Stock images
      "images.unsplash.com",  // Additional Unsplash domain
      "example.com",          // For testing purposes
      "localhost"             // For local development
    ],
  },
};

export default nextConfig;
