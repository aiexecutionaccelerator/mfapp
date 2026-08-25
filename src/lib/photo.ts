/**
 * Proof photos are stored as size-capped data URLs on the mission row itself:
 * private via RLS, identical in demo mode, and no Storage bucket to manage.
 * The cap matches the DB check in migration 0007 (500k chars).
 */

const MAX_EDGE = 1024;
const DATA_URL_MAX = 400_000;
const QUALITY_STEPS = [0.8, 0.6, 0.4];

export async function fileToProofPhoto(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not read the photo");
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  for (const quality of QUALITY_STEPS) {
    const url = canvas.toDataURL("image/jpeg", quality);
    if (url.length <= DATA_URL_MAX) return url;
  }
  throw new Error("That photo is too large. Try a smaller one.");
}
