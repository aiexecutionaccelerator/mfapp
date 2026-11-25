"use client";

import { MoreVertical, Share } from "lucide-react";
import { useState, type ReactNode } from "react";
import Button from "@/components/ui/Button";
import Sheet from "@/components/ui/Sheet";

/**
 * "Save as an app": one tap (Antonio, 25 Nov: "it wasn't a one button
 * thing"). On Android and desktop Chrome it opens the browser's own install
 * prompt straight away. iPhone has no install API, so there it shows the two
 * Safari steps with an arrow pointing down at the Share button. Anywhere the
 * prompt isn't offered, the sheet shows both recipes.
 */

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// Chrome fires this once, early, often before this screen mounts: keep it.
const install: { event: InstallPromptEvent | null } = { event: null };
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    install.event = event as InstallPromptEvent;
  });
  window.addEventListener("appinstalled", () => {
    install.event = null;
  });
}

/** Opens the browser's install prompt if it offered one. */
async function promptInstall(): Promise<boolean> {
  const event = install.event;
  if (!event) return false;
  install.event = null;
  await event.prompt();
  return true;
}

const isIos = () =>
  typeof navigator !== "undefined" &&
  (/iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

export default function SaveAsApp({
  className,
  trigger,
}: {
  className?: string;
  /** Renders its own opener, e.g. a Settings row. */
  trigger?: (open: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [ios, setIos] = useState(false);

  async function save() {
    if (await promptInstall()) return;
    setIos(isIos());
    setOpen(true);
  }

  return (
    <>
      {trigger ? (
        trigger(() => void save())
      ) : (
        <button
          type="button"
          onClick={() => void save()}
          className={className ?? "inline-flex min-h-12 items-center px-3"}
        >
          Save as an app
        </button>
      )}

      <Sheet
        open={open}
        title="SAVE IT AS AN APP"
        note="Put Mission Fragrances on your home screen. It opens full screen, like any other app."
        onClose={() => setOpen(false)}
      >
        {ios ? (
          <div className="glass rounded-[14px] p-4">
            <ol className="space-y-3 text-[17px] leading-snug text-ink-0">
              <li>
                1. Tap{" "}
                <Share aria-label="the Share button" size={18} className="inline -translate-y-0.5 text-gold-300" />{" "}
                at the bottom of Safari.
              </li>
              <li>
                2. Tap <span className="text-gold-300">Add to Home Screen</span>.
              </li>
            </ol>
          </div>
        ) : (
          <>
            <div className="glass rounded-[14px] p-4">
              <p className="eyebrow text-gold-300">IPHONE · SAFARI</p>
              <ol className="mt-3 space-y-2 text-[15px] leading-snug text-ink-1">
                <li>
                  1. Tap the Share button{" "}
                  <Share aria-label="Share icon" size={15} className="inline -translate-y-px text-ink-0" /> at the
                  bottom of the screen.
                </li>
                <li>
                  2. Tap <span className="text-ink-0">Add to Home Screen</span>.
                </li>
              </ol>
            </div>
            <div className="glass rounded-[14px] p-4">
              <p className="eyebrow text-gold-300">ANDROID · CHROME</p>
              <ol className="mt-3 space-y-2 text-[15px] leading-snug text-ink-1">
                <li>
                  1. Tap the menu{" "}
                  <MoreVertical aria-label="Menu icon" size={15} className="inline -translate-y-px text-ink-0" /> in
                  the top right.
                </li>
                <li>
                  2. Tap <span className="text-ink-0">Install app</span> or{" "}
                  <span className="text-ink-0">Add to Home screen</span>.
                </li>
              </ol>
            </div>
          </>
        )}

        <Button variant="secondary" onClick={() => setOpen(false)}>
          GOT IT
        </Button>
      </Sheet>

      {/* iPhone: an arrow down at Safari's Share button, under the sheet. */}
      {open && ios && (
        <div aria-hidden className="save-arrow pointer-events-none fixed bottom-2 left-1/2 z-[60] -translate-x-1/2 text-gold-300">
          <svg width="34" height="48" viewBox="0 0 34 48" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 3v40M5 31l12 12 12-12" />
          </svg>
        </div>
      )}
    </>
  );
}
