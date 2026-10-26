"use client";

import { Share, MoreVertical } from "lucide-react";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Sheet from "@/components/ui/Sheet";

/**
 * "Save as an app" — how to put the web app on the home screen. Two short
 * recipes, iPhone and Android, because those are the only two a man is
 * holding. No install prompt API: iOS has none, and a recipe works the same
 * everywhere.
 */
export default function SaveAsApp({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className ?? "inline-flex min-h-12 items-center px-3"}
      >
        Save as an app
      </button>

      <Sheet
        open={open}
        title="SAVE IT AS AN APP"
        note="Put Mission Fragrances on your home screen. It opens full screen, like any other app."
        onClose={() => setOpen(false)}
      >
        <div className="glass rounded-[14px] p-4">
          <p className="eyebrow text-gold-300">IPHONE · SAFARI</p>
          <ol className="mt-3 space-y-2 text-[15px] leading-snug text-ink-1">
            <li>
              1. Tap the Share button{" "}
              <Share
                aria-label="Share icon"
                size={15}
                className="inline -translate-y-px text-ink-0"
              />{" "}
              at the bottom of the screen.
            </li>
            <li>
              2. Scroll down and tap <span className="text-ink-0">Add to Home Screen</span>.
            </li>
            <li>
              3. Tap <span className="text-ink-0">Add</span>.
            </li>
          </ol>
        </div>

        <div className="glass rounded-[14px] p-4">
          <p className="eyebrow text-gold-300">ANDROID · CHROME</p>
          <ol className="mt-3 space-y-2 text-[15px] leading-snug text-ink-1">
            <li>
              1. Tap the menu{" "}
              <MoreVertical
                aria-label="Menu icon"
                size={15}
                className="inline -translate-y-px text-ink-0"
              />{" "}
              in the top right.
            </li>
            <li>
              2. Tap <span className="text-ink-0">Add to Home screen</span> or{" "}
              <span className="text-ink-0">Install app</span>.
            </li>
            <li>
              3. Tap <span className="text-ink-0">Install</span>.
            </li>
          </ol>
        </div>

        <Button variant="secondary" onClick={() => setOpen(false)}>
          GOT IT
        </Button>
      </Sheet>
    </>
  );
}
