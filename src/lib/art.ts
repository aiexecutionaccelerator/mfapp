/**
 * Real brand art drops into `public/images/`. Until a file is actually there,
 * the components render their built-in placeholder instead of requesting a URL
 * that 404s — one failed request per bottle, per screen, is console noise that
 * hides real errors.
 *
 * When the art lands, add its filename here in the same commit.
 */
const AVAILABLE = new Set<string>([]);

/** `/images/{file}` when that file exists, otherwise null. */
export function artUrl(file: string): string | null {
  return AVAILABLE.has(file) ? `/images/${file}` : null;
}
