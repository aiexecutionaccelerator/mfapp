import { APP_URL } from "@/lib/env";

/**
 * Sharing the app — the address, the words, and the two ways out of the
 * browser (the device's own share sheet, or a platform's share link).
 *
 * The copy is written for a man sending it to a friend or posting it as
 * himself: first person, short, no pitch.
 */

export const SHARE_URL = (APP_URL || "https://app.missionfragrances.com").replace(
  /\/$/,
  "",
);

/** "app.missionfragrances.com" — the address as a man would type it. */
export const SHARE_HOST = new URL(SHARE_URL).host;

/** The square image from Settings → Share, built once at deploy time. */
export const SHARE_IMAGE_PATH = "/share-card.png";

export const SHARE_TEXT = {
  /** The one line under a link, wherever a link goes. */
  short:
    "30 Missions. One minute each. Proof you're becoming the man you know yourself to be.",
  /** X counts characters, so it gets the tightest version. */
  x: "30 Missions. One minute each. Proof I'm becoming the man I know myself to be. #MissionFragrances",
  /** Texts and WhatsApp read like a message from a friend. */
  message:
    "I'm doing the 30-Day Mission from Mission Fragrances. One real action a day, about a minute each. Try it with me:",
  /** Instagram, Facebook and LinkedIn take a full caption he pastes himself. */
  caption: `I'm doing the 30-Day Mission from Mission Fragrances. One real action a day, about a minute each. Every one gets logged as proof. Join me: ${SHARE_HOST} #MissionFragrances`,
  emailSubject: "Try this with me: the 30-Day Mission",
};

export type Platform =
  | "messages"
  | "whatsapp"
  | "facebook"
  | "x"
  | "linkedin"
  | "email";

const enc = encodeURIComponent;

/** The share link for each platform. Each opens prefilled; he only posts. */
export function platformUrl(platform: Platform): string {
  const url = SHARE_URL;
  switch (platform) {
    case "messages":
      // "?&body=" is the form both iOS and Android read.
      return `sms:?&body=${enc(`${SHARE_TEXT.message} ${url}`)}`;
    case "whatsapp":
      return `https://wa.me/?text=${enc(`${SHARE_TEXT.message} ${url}`)}`;
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`;
    case "x":
      return `https://x.com/intent/post?text=${enc(SHARE_TEXT.x)}&url=${enc(url)}`;
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`;
    case "email":
      return `mailto:?subject=${enc(SHARE_TEXT.emailSubject)}&body=${enc(`${SHARE_TEXT.message}\n\n${url}`)}`;
  }
}

export type ShareResult = "shared" | "copied" | "cancelled" | "failed";

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** The device share sheet with the link; the clipboard where there is none. */
export async function shareLink(): Promise<ShareResult> {
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({
        title: "Mission Fragrances",
        text: SHARE_TEXT.short,
        url: SHARE_URL,
      });
      return "shared";
    } catch (err) {
      if ((err as Error)?.name === "AbortError") return "cancelled";
    }
  }
  return (await copyText(SHARE_URL)) ? "copied" : "failed";
}

async function shareImageFile(): Promise<File> {
  const res = await fetch(SHARE_IMAGE_PATH);
  if (!res.ok) throw new Error(`share image ${res.status}`);
  return new File([await res.blob()], "mission-fragrances.png", {
    type: "image/png",
  });
}

/**
 * The image, the caption and the link in one share sheet — on a phone that
 * can share files (iOS, Android). Anywhere else it falls back to the link.
 */
export async function shareImage(): Promise<ShareResult> {
  try {
    const file = await shareImageFile();
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: "Mission Fragrances",
        text: `${SHARE_TEXT.caption}`,
      });
      return "shared";
    }
  } catch (err) {
    if ((err as Error)?.name === "AbortError") return "cancelled";
  }
  return shareLink();
}

/** Saves the square image, for Instagram, where nothing can be prefilled. */
export function downloadImage() {
  const a = document.createElement("a");
  a.href = SHARE_IMAGE_PATH;
  a.download = "mission-fragrances.png";
  document.body.appendChild(a);
  a.click();
  a.remove();
}
