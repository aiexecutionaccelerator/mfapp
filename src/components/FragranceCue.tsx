"use client";

import { ArrowLeftRight } from "lucide-react";
import BottleVisual from "@/components/BottleVisual";
import { TRIGGERS, TRIGGER_ACCENTS, TRIGGER_ORDER } from "@/content/triggers";
import type { Trigger } from "@/lib/data/types";
import { cn } from "@/lib/utils";

/**
 * The fragrance for this Mission — the shelf, not a dropdown.
 *
 * All three bottles sit on their own tiles. The one the Mission calls for is
 * picked up: full size, lit, named, carrying the spray instruction. The other
 * two stand back on outlined tiles, one tap away, each labelled so a new man
 * knows what he would be switching to. So the recommendation is obvious, and
 * changing it costs one tap with nothing to open or find.
 *
 * It also carries the T of S.T.A.R. When the ritual screen was folded away,
 * "spray it and recall a moment you lived this" lost its home; it belongs on
 * the screen he is looking at while he sprays.
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
  const meta = TRIGGERS[value];
  const tone = TRIGGER_ACCENTS[value];
  const onRecommendation = recommended !== undefined && value === recommended;

  return (
    <div
      className={cn(
        "glass relative overflow-hidden rounded-[20px] px-4 pt-3 pb-5",
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

      {/* Says out loud what the tiles imply: this one is yours to change. */}
      <p className="eyebrow relative flex items-center justify-end gap-1.5 text-ink-2">
        <ArrowLeftRight aria-hidden size={12} className="shrink-0" />
        TAP TO CHANGE
      </p>

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
              className="bottle-tile flex flex-col items-center rounded-[14px] px-1 pt-3 pb-2"
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
              {/* Which one the Mission asks for, whatever he picks. */}
              <span
                aria-hidden
                className={cn(
                  "mt-1.5 block h-1 w-1 rounded-full",
                  trigger === recommended
                    ? "bg-[var(--gold-500)]"
                    : "bg-transparent",
                )}
              />
            </button>
          );
        })}
      </div>

      <div className="relative mt-4 text-center">
        <p className="eyebrow text-ink-2">
          {recommended === undefined
            ? "YOUR FRAGRANCE"
            : onRecommendation
              ? "WEAR THIS FOR MISSION"
              : "YOUR CHOICE · THE DOT MARKS THE RECOMMENDATION"}
        </p>
        {/* Keyed so the line remounts on a switch: iOS Safari splices text
            that changes in place inside a backdrop-filtered card. */}
        <p
          key={value}
          className="font-display mt-1.5 text-[26px] leading-none"
          style={{
            color: value === "commitment" ? "var(--ink-0)" : tone.color,
          }}
        >
          {meta.name}
        </p>
        <p key={`${value}-line`} className="mt-2 text-[13px] leading-snug text-ink-1">
          {meta.starRecall}
        </p>
      </div>
    </div>
  );
}
