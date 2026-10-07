import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // The free-form flow moved from /mission/* to /action/* when Missions
      // (the thirty numbered ones) and Actions were split. Push reminders
      // already queued with the old path must still land somewhere real.
      { source: "/mission/:path*", destination: "/action/:path*", permanent: true },
      // The ritual and check-in screens were folded into the action itself.
      // Reminders queued with the old links must still land somewhere real.
      { source: "/action/checkin/:id", destination: "/action/active/:id", permanent: true },
      { source: "/action/trigger", destination: "/home", permanent: false },
    ];
  },
};

export default nextConfig;
