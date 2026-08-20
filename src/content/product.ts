export const PRODUCT = {
  eyebrow: "MISSION FRAGRANCES",
  headline: "THE COMPLETE SET",
  price: "$595",
  edition: "Black Edition",
  /** The live product page. The CTA opens it in a new tab. */
  url: "https://www.missionfragrances.com/products/mission-fragrances-set",
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
  cta: "GET MISSION FRAGRANCES — $595",
  ctaNote:
    "Secure checkout by Shopify. Shipping and taxes calculated at checkout.",
  /** Slim buy row at the bottom of Course, Log and Progress. */
  buyRowText: "Don't own Mission Fragrances yet?",
  buyRowCta: "Get the set — $595",
  /** Filename under public/images — see lib/art.ts. */
  heroImage: "mfset.png",
} as const;
