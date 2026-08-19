import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Progress merged into the Log tab; old bookmarks and PWA shortcuts still land.
  async redirects() {
    return [{ source: "/progress", destination: "/log", permanent: true }];
  },
};

export default nextConfig;
