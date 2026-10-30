import type { NextConfig } from "next";

/**
 * Security headers on every response (audit, 30 Oct 2026). Kept to the ones
 * that can't break anything: the app embeds YouTube and loads Supabase and
 * Shopify, so a full Content-Security-Policy needs its own careful pass. The
 * CSP here only forbids other sites from framing the app (clickjacking).
 */
const SECURITY_HEADERS = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
  // The app uses the camera only through the file picker (Mission photos),
  // which doesn't need the permission. Nothing uses the mic or location.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
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
