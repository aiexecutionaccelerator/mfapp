export const PRODUCT = {
  eyebrow: "MISSION FRAGRANCES",
  headline: "THE COMPLETE SET",
  edition: "Black Edition",
  /** The live product page. The CTA opens it in a new tab. */
  url: "https://www.missionfragrances.com/products/mf-special",
  included: [
    "Honor Eau de Parfum · 50ml",
    "Courage Eau de Parfum · 50ml",
    "Commitment Eau de Parfum · 50ml",
    "Premium presentation case",
    "3 travel atomizers",
    "Limited-edition challenge coin",
    "30-Day Wear-It Guarantee",
  ],
  positioning: "Honor. Courage. Commitment. Wear them with intent.",
  cta: "CLAIM YOUR SET",
  ctaNote:
    "Secure checkout by Shopify. Shipping and taxes calculated at checkout.",
  /** Slim buy row at the bottom of Course, Log and Progress. */
  buyRowText: "Don't own Mission Fragrances yet?",
  buyRowCta: "Click here to claim your set",
  /** Filename under public/images — see lib/art.ts. */
  heroImage: "mfset.png",
} as const;

/**
 * The set's price on Claim Your Set, with the regular price struck through
 * and the saving called out whenever it's marked down.
 *
 * Confirmed: $597 regular, $297 sale — $300 off. When the sale ends, set
 * compareAtPrice back to null (or price to the new number) so nothing is
 * struck through that isn't true. Keep Shopify's compare-at price matching,
 * so the store's own page strikes it through the same way.
 */
export const PRICING: { price: number | null; compareAtPrice: number | null } = {
  price: 297,
  compareAtPrice: 597,
};
