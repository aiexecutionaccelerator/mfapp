import { renderShareCard } from "@/lib/shareCard";

/** The square share image (1080×1080), built once at deploy time. */
export const dynamic = "force-static";

export function GET() {
  return renderShareCard("square");
}
