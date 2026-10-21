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
      { source: "/action/trigger", destination: "/missions", permanent: false },
      // Start is gone: logging is one click inside the Mission, so the app
      // opens on the Missions themselves. Old links, bookmarks and the
      // installed PWA's start_url must still land somewhere real.
      { source: "/home", destination: "/missions", permanent: false },
      { source: "/action/complete/:id", destination: "/log/:id", permanent: false },
    ];
  },
};

export default nextConfig;
