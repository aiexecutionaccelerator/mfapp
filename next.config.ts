import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // The free-form flow moved from /mission/* to /action/* when Missions
      // (the thirty numbered ones) and Actions were split. Push reminders
      // already queued with the old path must still land somewhere real.
      { source: "/mission/:path*", destination: "/action/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
