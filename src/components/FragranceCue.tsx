"use client";

import { ArrowLeftRight } from "lucide-react";
import BottleVisual from "@/components/BottleVisual";
import { TRIGGERS, TRIGGER_ACCENTS, TRIGGER_ORDER } from "@/content/triggers";
import type { Trigger } from "@/lib/data/types";
import { cn } from "@/lib/utils";

/**
 * The fragrance for this Mission — the shelf, not a dropdown.
 *
 * All three bottles sit on their own tiles, each labelled, so a new man can
 * see what he would be switching to. The one he is wearing is picked up —
 * full size, lit, standing in its own pool of light. The one the Mission
 * asks for carries an inner gold light and its own RECOMMENDED pill, so the
 * suggestion still reads once he has chosen something else.
 *
 * The card says nothing it does not have to: where he stands and the fact
 * that he can move, on one line, above the shelf.
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
  const tone = TRIGGER_ACCENTS[value];
  const onRecommendation = recommended !== undefined && value === recommended;

  return (
    <div
      className={cn(
        "glass relative overflow-hidden rounded-[20px] px-4 pt-3 pb-3",
        className,
      )}
      style={{
        boxShadow: `inset 0 1px 0 rgba(255,255,255,.06), 0 10px 30px rgba(0,0,0,.35), 0 0 40px ${tone.glow}`,
      }}
    >
      {/* The chosen value's colour down the edge and washing the corner. */}
      <span
        aria-hidden
        className="absolute top-0 bottom-0 left-0 w-[2px]"
        style={{
          background: tone.color,
          boxShadow: tone.edge ? `1px 0 0 ${tone.edge}` : undefined,
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -top-10 -left-10 h-48 w-48 rounded-full"
        style={{
          background: `radial-gradient(circle, ${tone.glow} 0%, transparent 68%)`,
        }}
      />

      {/* One row: where he stands on the left, and the fact that he can move
          on the right. No second line for either. */}
      <div className="eyebrow relative flex items-center justify-between gap-3 text-ink-2">
        <span className="min-w-0 truncate">
          {recommended !== undefined && !onRecommendation ? "YOUR CHOICE" : ""}
        </span>
        <span className="flex shrink-0 items-center gap-1.5">
          <ArrowLeftRight aria-hidden size={12} className="shrink-0" />
          TAP TO CHANGE
        </span>
      </div>

      <div
        role="radiogroup"
        aria-label="Which fragrance are you wearing?"
        className="relative mt-2 grid grid-cols-3 gap-2"
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
                  "--cue-color": accent.color,
                  "--cue-glow": accent.glow,
                } as React.CSSProperties
              }
            >
              <span className="relative flex h-[74px] items-end justify-center">
                <BottleVisual trigger={trigger} size={chosen ? 50 : 38} />
                <span
                  aria-hidden
                  className="bottle-pool absolute bottom-0 left-1/2 h-[6px] w-[46px] -translate-x-1/2 rounded-full"
                  style={{
                    background: `radial-gradient(ellipse, ${accent.glow} 0%, transparent 72%)`,
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
