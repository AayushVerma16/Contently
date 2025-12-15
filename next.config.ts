import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["images.unsplash.com", "img.clerk.com", "ik.imagekit.io"],
  },
  productionBrowserSourceMaps: false,
};

export default nextConfig;
