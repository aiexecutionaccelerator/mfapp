"use client";

import { Copy, Mail, MessageCircle, Share } from "lucide-react";
import BrandIcon, { type Brand } from "@/components/BrandIcon";
import NavAction from "@/components/NavAction";
import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import Headline from "@/components/ui/Headline";
import { useToast } from "@/components/ui/Toast";
import { track } from "@/lib/analytics";
import {
  copyText,
  downloadImage,
  platformUrl,
  SHARE_HOST,
  SHARE_IMAGE_PATH,
  SHARE_TEXT,
  SHARE_URL,
  shareImage,
  shareLink,
  type Platform,
} from "@/lib/share";

type Tile = {
  id: Platform | "instagram";
  label: string;
  icon: React.ReactNode;
};

const brand = (b: Brand) => <BrandIcon brand={b} />;

const TILES: Tile[] = [
  { id: "messages", label: "Messages", icon: <MessageCircle size={22} aria-hidden /> },
  { id: "whatsapp", label: "WhatsApp", icon: brand("whatsapp") },
  { id: "instagram", label: "Instagram", icon: brand("instagram") },
  { id: "facebook", label: "Facebook", icon: brand("facebook") },
  { id: "x", label: "X", icon: brand("x") },
  { id: "linkedin", label: "LinkedIn", icon: brand("linkedin") },
  { id: "email", label: "Email", icon: <Mail size={22} aria-hidden /> },
];

const TILE_CLASS =
  "glass flex min-h-[76px] flex-col items-center justify-center gap-2 rounded-[14px] px-1 text-[12px] text-ink-1 transition-colors hover:text-ink-0";

/**
 * Share the app — the link first (it's what he came for), one tap per
 * platform, then the image. Every platform link opens prefilled with the URL. Instagram can't be prefilled from the web, so it gets the
 * image and the caption on the clipboard instead.
 */
export default function SharePage() {
  const { showToast } = useToast();

  async function shareTheLink() {
    const result = await shareLink();
    track("app_shared", { via: "native-link", result });
    if (result === "copied") showToast("Link copied. Paste it anywhere.");
    if (result === "failed") showToast("Couldn't share. Tap Copy instead.");
  }

  async function shareWithImage() {
    const result = await shareImage();
    track("app_shared", { via: "native-image", result });
    if (result === "copied") showToast("Link copied.");
    if (result === "failed") showToast("Couldn't share. Tap Copy instead.");
  }

  async function instagram() {
    const copied = await copyText(SHARE_TEXT.caption);
    track("app_shared", { via: "instagram" });
    const result = await shareImage();
    // No file sharing here (a computer): save the image instead.
    if (result === "copied" || result === "failed") {
      downloadImage();
      showToast(
        copied
          ? "Image saved. Caption copied. Paste it in Instagram."
          : "Image saved.",
      );
    } else if (copied && result === "shared") {
      showToast("Caption copied. Paste it in Instagram.");
    }
  }

  async function copy(text: string, what: string) {
    const ok = await copyText(text);
    showToast(ok ? `${what} copied.` : `Couldn't copy the ${what.toLowerCase()}.`);
  }

  return (
    <main className="flex flex-1 flex-col pt-2 pb-8">
      <div className="flex">
        <NavAction kind="back" href="/settings" />
      </div>

      <Headline className="mt-2">SHARE THE APP</Headline>

      {/* The link is the thing he came for: shown, copyable, shareable. */}
      <div className="glass mt-6 flex items-center gap-3 rounded-[14px] py-2 pr-2 pl-4">
        <span className="min-w-0 flex-1 text-[15px] break-all text-ink-0">
          {SHARE_HOST}
        </span>
        <button
          type="button"
          onClick={() => {
            track("app_shared", { via: "copy-link" });
            void copy(SHARE_URL, "Link");
          }}
          className="inline-flex min-h-12 items-center gap-2 px-3 text-[14px] font-semibold tracking-[0.08em] text-gold-300"
        >
          <Copy size={16} aria-hidden />
          COPY
        </button>
      </div>

      <div className="mt-4">
        <Button onClick={() => void shareTheLink()}>
          <Share size={18} aria-hidden />
          SHARE THE LINK
        </Button>
      </div>

      <Eyebrow className="mt-8">Or pick where</Eyebrow>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {TILES.map((tile) => {
          const body = (
            <>
              <span className="text-ink-0">{tile.icon}</span>
              {tile.label}
            </>
          );
          if (tile.id === "instagram") {
            return (
              <button
                key={tile.id}
                type="button"
                className={TILE_CLASS}
                onClick={() => void instagram()}
              >
                {body}
              </button>
            );
          }
          const href = platformUrl(tile.id);
          const web = href.startsWith("http");
          return (
            <a
              key={tile.id}
              href={href}
              target={web ? "_blank" : undefined}
              rel={web ? "noopener noreferrer" : undefined}
              className={TILE_CLASS}
              onClick={() => track("app_shared", { via: tile.id })}
            >
              {body}
            </a>
          );
        })}
      </div>

      <Eyebrow className="mt-8">Or send the image</Eyebrow>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={SHARE_IMAGE_PATH}
        alt="Mission Fragrances share image: the three bottles and Turn Scent Into Action."
        width={1080}
        height={1080}
        className="mx-auto mt-3 aspect-square w-full max-w-[300px] rounded-[18px] border border-[var(--line)] shadow-[0_18px_50px_rgba(0,0,0,.5),0_0_40px_rgba(201,166,72,.12)]"
      />
      <div className="mt-4">
        <Button variant="secondary" onClick={() => void shareWithImage()}>
          SHARE THE IMAGE
        </Button>
      </div>
    </main>
  );
}
