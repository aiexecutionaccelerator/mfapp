"use client";

import { useState } from "react";
import BottleVisual from "@/components/BottleVisual";
import { TRIGGERS, TRIGGER_ACCENTS, TRIGGER_ORDER } from "@/content/triggers";
import { track } from "@/lib/analytics";
import type { Trigger } from "@/lib/data/types";

/**
 * The three bottles, side by side, at the foot of the Missions list.
 *
 * They light up on hover and open on tap — a man who forgets what Commitment
 * is for shouldn't have to replay onboarding to find out. Hover is the
 * desktop affordance; tap is the real one, so everything hover does, the
 * open state does too.
 */
export default function FragranceTrio() {
  const [open, setOpen] = useState<Trigger | null>(null);
  const meta = open ? TRIGGERS[open] : null;

  return (
    <section className="mt-10">
      <p className="eyebrow text-ink-2">YOUR THREE FRAGRANCES</p>
      <p className="mt-2 text-[13px] text-ink-2">
        Tap a bottle to remember what it is for.
      </p>

      <div className="mt-4 flex gap-3">
        {TRIGGER_ORDER.map((trigger) => {
          const tone = TRIGGER_ACCENTS[trigger];
          const isOpen = open === trigger;
          return (
            <button
              key={trigger}
              type="button"
              aria-expanded={isOpen}
              aria-label={`What ${TRIGGERS[trigger].name.toLowerCase()} is for`}
              data-open={isOpen}
              onClick={() => {
                const next = isOpen ? null : trigger;
                setOpen(next);
                if (next) track("fragrance_opened", { selectedTrigger: next });
              }}
              className="bottle-tile relative flex flex-1 flex-col items-center rounded-[18px] px-2 pt-5 pb-3"
              style={
                {
                  "--cue-color": tone.color,
                  "--cue-glow": tone.glow,
                } as React.CSSProperties
              }
            >
              <span className="relative flex items-end justify-center">
                <BottleVisual trigger={trigger} size={44} />
                {/* The pool of light it stands in — brightens with the tile. */}
                <span
                  aria-hidden
                  className="bottle-pool absolute bottom-0 left-1/2 h-[6px] w-[46px] -translate-x-1/2 rounded-full"
                  style={{
                    background: `radial-gradient(ellipse, ${tone.glow} 0%, transparent 72%)`,
                  }}
                />
              </span>
              <span
                className="font-display mt-3 text-[15px] leading-none"
                style={{
                  color:
                    trigger === "commitment" && !isOpen
                      ? "var(--ink-1)"
                      : isOpen
                        ? "var(--ink-0)"
                        : "var(--ink-1)",
                }}
              >
                {TRIGGERS[trigger].name}
              </span>
            </button>
          );
        })}
      </div>

      {meta && open && (
        <div
          key={open}
          className="glass fade-in relative mt-3 overflow-hidden rounded-[18px] p-5"
          style={{
            boxShadow: `inset 0 1px 0 rgba(255,255,255,.06), 0 10px 30px rgba(0,0,0,.35), 0 0 34px ${TRIGGER_ACCENTS[open].glow}`,
          }}
        >
          <span
            aria-hidden
            className="absolute top-0 bottom-0 left-0 w-[2px]"
            style={{ background: TRIGGER_ACCENTS[open].color }}
          />
          <p className="eyebrow text-gold-300">{meta.tagline}</p>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-1">
            {meta.about}
          </p>
        </div>
      )}
    </section>
  );
}
