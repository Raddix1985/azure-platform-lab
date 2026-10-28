import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output : "standalone",
  allowedDevOrigins: ["192.168.10.96"],
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
