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

/** Demo mode runs entirely on-device when Supabase is not configured. */
export function isDemo(): boolean {
  return !SUPABASE_URL || !SUPABASE_ANON_KEY;
}

export function hasShopify(): boolean {
  return Boolean(
    SHOPIFY_STORE_DOMAIN && SHOPIFY_STOREFRONT_TOKEN && SHOPIFY_MISSION_VARIANT_ID,
  );
}

// TODO: replace with the real legal URLs before launch.
export const LEGAL_PRIVACY_URL = "#";
export const LEGAL_TERMS_URL = "#";
export const SUPPORT_EMAIL = "support@missionfragrances.com";
