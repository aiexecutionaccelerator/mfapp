"use client";

import BottleVisual from "@/components/BottleVisual";
import { TRIGGERS, TRIGGER_ACCENTS, TRIGGER_ORDER } from "@/content/triggers";
import type { Trigger } from "@/lib/data/types";
import { cn } from "@/lib/utils";

/**
 * The fragrance shelf — three bottles, one picked up.
 *
 * No card around it: the tiles are the surface, and a card holding cards is
 * one box too many. Each is labelled so a man who doesn't know the set by
 * sight can see what he would be switching to. The one the Mission asks for
 * carries an inner gold light and its own RECOMMENDED pill, which stays put
 * once he has chosen something else.
 *
 * Tinting uses the accent's `ui` colour, not its fill: Commitment's bottle is
 * black and has no colour to glow with, so it takes an ivory rim instead.
 */
export default function FragranceCue({
  value,
  onChange,
  recommended,
  className,
}: {
  value: Trigger;
  onChange: (next: Trigger) => void;
  /** The Mission's suggestion. Omitted for a one-off Action. */
  recommended?: Trigger;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="eyebrow text-gold-300">
        SELECT THE FRAGRANCE YOU&apos;RE WEARING
      </p>

      <div
        role="radiogroup"
        aria-label="Which fragrance are you wearing?"
        className="mt-3 grid grid-cols-3 gap-2"
      >
        {TRIGGER_ORDER.map((trigger) => {
          const chosen = trigger === value;
          const accent = TRIGGER_ACCENTS[trigger];
          return (
            <button
              key={trigger}
              type="button"
              role="radio"
              aria-checked={chosen}
              aria-label={TRIGGERS[trigger].name.toLowerCase()}
              data-open={chosen}
              onClick={() => onChange(trigger)}
              className={cn(
                "bottle-tile flex flex-col items-center rounded-[14px] px-1 pt-3 pb-2",
                trigger === recommended && "is-recommended",
              )}
              style={
                {
                  "--cue-color": accent.ui,
                  "--cue-glow": accent.uiGlow,
                } as React.CSSProperties
              }
            >
              <span className="relative flex h-[74px] items-end justify-center">
                <BottleVisual trigger={trigger} size={chosen ? 50 : 38} />
                {/* The pool of light it stands in — brightens with the tile. */}
                <span
                  aria-hidden
                  className="bottle-pool absolute bottom-0 left-1/2 h-[6px] w-[46px] -translate-x-1/2 rounded-full"
                  style={{
                    background: `radial-gradient(ellipse, ${accent.uiGlow} 0%, transparent 72%)`,
                  }}
                />
              </span>
              <span
                className={cn(
                  "mt-2 block text-[10px] tracking-[0.1em] uppercase",
                  chosen ? "text-ink-0" : "text-ink-2",
                )}
              >
                {TRIGGERS[trigger].name}
              </span>
              {/* Which one the Mission asks for, whatever he picks. The
                  spacer keeps all three tiles the same height. */}
              {trigger === recommended ? (
                <span className="mt-2 block rounded-full border border-[rgba(201,166,72,.45)] px-1.5 py-[2px] text-[8px] leading-none tracking-[0.1em] text-gold-300 uppercase">
                  Recommended
                </span>
              ) : (
                <span aria-hidden className="mt-2 block h-[14px]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
