export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const SHOPIFY_STORE_DOMAIN =
  process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ?? "";
export const SHOPIFY_STOREFRONT_TOKEN =
  process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN ?? "";
export const SHOPIFY_MISSION_VARIANT_ID =
  process.env.NEXT_PUBLIC_SHOPIFY_MISSION_VARIANT_ID ?? "";

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";
export const DEV_TOOLS = process.env.NEXT_PUBLIC_DEV_TOOLS === "true";

/** VAPID public key for Web Push. Empty ⇒ in-app reminders only. */
export const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

/** Demo mode runs entirely on-device when Supabase is not configured. */
export function isDemo(): boolean {
  return !SUPABASE_URL || !SUPABASE_ANON_KEY;
}

/** Push needs a real backend to store the subscription and a VAPID key. */
export function hasPush(): boolean {
  return !isDemo() && Boolean(VAPID_PUBLIC_KEY);
}

export function hasShopify(): boolean {
  return Boolean(
    SHOPIFY_STORE_DOMAIN && SHOPIFY_STOREFRONT_TOKEN && SHOPIFY_MISSION_VARIANT_ID,
  );
}

// In-app legal pages (src/app/privacy, src/app/terms).
export const LEGAL_PRIVACY_URL = "/privacy";
export const LEGAL_TERMS_URL = "/terms";
export const SUPPORT_EMAIL = "antonio@missionfragrances.com";
