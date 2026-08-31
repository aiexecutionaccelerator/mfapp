"use client";

import { HelpCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Sheet from "@/components/ui/Sheet";

/**
 * The one screen that keeps the two verticals straight: numbered Missions
 * (the 30-day path) vs. Actions (a one-off from Start). Opened by the "?"
 * in the Start header — never blocks anything.
 */
export default function HelpSheet() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="What's the difference between a Mission and an Action?"
        onClick={() => setOpen(true)}
        className="flex h-12 w-12 shrink-0 items-center justify-center text-ink-2"
      >
        <HelpCircle size={22} aria-hidden />
      </button>

      <Sheet
        open={open}
        title="MISSIONS & ACTIONS"
        onClose={() => setOpen(false)}
      >
        <div className="space-y-4 text-left">
          <div>
            <p className="eyebrow text-gold-300">AN ACTION</p>
            <p className="mt-1.5 text-[15px] leading-relaxed text-ink-1">
              One real thing you do today. Pick a fragrance on this screen,
              choose or write the action, wear the scent, do it, and log the
              proof. Take as many as you like, any day.
            </p>
          </div>

          <div>
            <p className="eyebrow text-gold-300">A MISSION</p>
            <p className="mt-1.5 text-[15px] leading-relaxed text-ink-1">
              One of the thirty numbered steps in the Mission tab. Each gives
              you an idea, a question, and suggested actions. A Mission is
              complete when you log the proof — reading it does nothing.
            </p>
          </div>

          <div>
            <p className="eyebrow text-gold-300">BOTH COUNT</p>
            <p className="mt-1.5 text-[15px] leading-relaxed text-ink-1">
              Every completed Action and Mission lands in your Proof Log as
              proof. Only the thirty numbered ones move your 30-Mission count.
            </p>
          </div>
        </div>

        <Link href="/how-it-works" className="block" onClick={() => setOpen(false)}>
          <Button variant="secondary">SEE HOW IT WORKS</Button>
        </Link>
        <Button variant="ghost" onClick={() => setOpen(false)}>
          Got it
        </Button>
      </Sheet>
    </>
  );
}
