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
 * UNCONFIRMED — both stay null, and the price block stays hidden, until
 * Antonio confirms them. The live store disagrees with itself: the landing
 * page shows $595, the special page $297, and Antonio said $597 as the
 * regular price. A wrong struck-through "regular" price on a sales page is
 * worse than no price at all. Set the two numbers (whole dollars) here once
 * they're confirmed, and set the same compare-at price in Shopify so the
 * store's own page strikes it through too.
 */
export const PRICING: { price: number | null; compareAtPrice: number | null } = {
  price: null,
  compareAtPrice: null,
};
