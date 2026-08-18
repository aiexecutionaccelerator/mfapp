import type { Trigger } from "@/lib/data/types";

/**
 * Brand art in `public/images/`. Only files listed here are ever requested, so
 * a missing asset falls back to the component's built-in placeholder instead of
 * a 404 on every screen.
 */
const AVAILABLE = new Set<string>([
  "logo.png", // MFJ crest (shield + sword), transparent
  "mflogo.png", // full "MISSION ⟡ FRAGRANCES" wordmark, transparent
  "honor.png", // bottle cutouts
  "courage.png",
  "commitment.png",
  "mainpage.png", // hero: tilted Courage bottle with the set behind
  "mfset.png", // open presentation box with all three bottles
]);

/** `/images/{file}` when that file exists, otherwise null. */
export function artUrl(file: string): string | null {
  return AVAILABLE.has(file) ? `/images/${file}` : null;
}

export const ART = {
  crest: "logo.png",
  wordmark: "mflogo.png",
  hero: "mainpage.png",
  set: "mfset.png",
} as const;

export function bottleArt(trigger: Trigger): string | null {
  return artUrl(`${trigger}.png`);
}
