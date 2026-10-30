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

/**
 * Antonio's three-bottle composite for the Welcome hero. Welcome tries it and
 * falls back to composing the trio from the individual cutouts if the file
 * isn't in public/images/ yet.
 */
export const HERO_COMPOSITE_URL = "/images/3bottleswhite.webp";

/**
 * PNGs that have a smaller .webp twin (made by scripts/optimize-images.mjs).
 * The screens get the .webp; the PNG stays for the share-card renderer.
 */
const WEBP = new Set([
  "3bottleswhite.png",
  "logo.png",
  "honor.png",
  "courage.png",
  "commitment.png",
  "mainpage.png",
  "mfset.png",
]);

/** `/images/{file}` (as .webp when there is one) if it exists, else null. */
export function artUrl(file: string): string | null {
  if (!AVAILABLE.has(file)) return null;
  return `/images/${WEBP.has(file) ? file.replace(/\.png$/, ".webp") : file}`;
}

export const ART = {
  crest: "logo.png",
  wordmark: "mflogo.png",
  hero: "mainpage.png",
} as const;

export function bottleArt(trigger: Trigger): string | null {
  return artUrl(`${trigger}.png`);
}
