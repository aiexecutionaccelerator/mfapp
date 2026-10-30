/* Makes a .webp copy of every brand PNG in public/images when it comes out
   meaningfully smaller (the app serves the .webp; the PNGs stay for the
   share-card renderer and as sources). Keep src/lib/art.ts WEBP in step.
   Run after adding or changing art: node scripts/optimize-images.mjs */
import { readdirSync, statSync, unlinkSync } from "node:fs";
import sharp from "sharp";

const DIR = new URL("../public/images/", import.meta.url).pathname;
// Twice the largest size each is drawn at, for sharp phone screens.
const MAX_WIDTH = 900;

for (const file of readdirSync(DIR).filter((f) => f.endsWith(".png"))) {
  const src = `${DIR}${file}`;
  const out = src.replace(/\.png$/, ".webp");
  const meta = await sharp(src).metadata();
  await sharp(src)
    .resize({ width: Math.min(meta.width ?? MAX_WIDTH, MAX_WIDTH), withoutEnlargement: true })
    .webp({ quality: 82, alphaQuality: 90, effort: 6 })
    .toFile(out);
  const before = statSync(src).size;
  const after = statSync(out).size;
  // Flat logos can compress better as PNG: keep whichever is smaller.
  if (after >= before * 0.9) unlinkSync(out);
  console.log(
    `${file} ${meta.width}×${meta.height}  ${Math.round(before / 1024)} KB → ` +
      (after >= before * 0.9 ? "kept PNG" : `${Math.round(after / 1024)} KB webp`),
  );
}
