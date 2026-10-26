import { renderShareCard, SHARE_SIZES } from "@/lib/shareCard";

/** The preview card when the app's address is pasted anywhere. */
export const alt = "Mission Fragrances: Turn scent into action.";
export const size = SHARE_SIZES.link;
export const contentType = "image/png";

export default function Image() {
  return renderShareCard("link");
}
