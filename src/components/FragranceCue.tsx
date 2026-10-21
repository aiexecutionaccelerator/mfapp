"use client";

import BottleVisual from "@/components/BottleVisual";
import { TRIGGERS, TRIGGER_ACCENTS, TRIGGER_ORDER } from "@/content/triggers";
import type { Trigger } from "@/lib/data/types";
import { cn } from "@/lib/utils";

/**
 * The fragrance for this Mission — the shelf, not a dropdown.
 *
 * All three bottles are on screen. The one the Mission calls for is picked
 * up: full size, lit, named, carrying the spray instruction. The other two
 * stand back, dimmed, one tap away. So the recommendation is obvious and
 * changing it costs nothing — no picker to open, no link to find, and
 * nothing to read before he understands it.
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
        "glass relative overflow-hidden rounded-[20px] px-4 pt-4 pb-5",
        className,
      )}
      style={{
        boxShadow: `inset 0 1px 0 rgba(255,255,255,.06), 0 10px 30px rgba(0,0,0,.35), 0 0 40px ${tone.glow}`,
      }}
    >
      {/* The chosen value's colour down the edge and washing the corner. */}
      <span
        aria-hidden
        className="absolute top-0 bottom-0 left-0 w-[2px] transition-colors duration-300"
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

      <div
        role="radiogroup"
        aria-label="Which fragrance are you wearing?"
        className="relative flex items-end justify-center gap-6"
      >
        {TRIGGER_ORDER.map((trigger) => {
          const chosen = trigger === value;
          const glow = TRIGGER_ACCENTS[trigger].glow;
          return (
            <button
              key={trigger}
              type="button"
              role="radio"
              aria-checked={chosen}
              aria-label={TRIGGERS[trigger].name.toLowerCase()}
              onClick={() => onChange(trigger)}
              className={cn(
                "relative flex flex-col items-center transition-all duration-300",
                chosen ? "opacity-100" : "opacity-45 hover:opacity-80",
              )}
            >
              <span className="relative flex items-end justify-center">
                <BottleVisual trigger={trigger} size={chosen ? 56 : 38} />
                {/* The pool of light the chosen bottle stands in. */}
                <span
                  aria-hidden
                  className="absolute bottom-0 left-1/2 h-[7px] -translate-x-1/2 rounded-full transition-opacity duration-300"
                  style={{
                    width: chosen ? 54 : 36,
                    opacity: chosen ? 1 : 0,
                    background: `radial-gradient(ellipse, ${glow} 0%, transparent 72%)`,
                  }}
                />
              </span>
              {/* Which one the Mission asks for, whatever he picks. */}
              <span
                aria-hidden
                className={cn(
                  "mt-2 block h-1 w-1 rounded-full",
                  trigger === recommended
                    ? "bg-[var(--gold-500)]"
                    : "bg-transparent",
                )}
              />
            </button>
          );
        })}
      </div>

      <div className="relative mt-3 text-center">
        <p className="eyebrow text-ink-2">
          {recommended === undefined
            ? "CHOOSE YOUR FRAGRANCE"
            : onRecommendation
              ? "WEAR THIS FOR MISSION"
              : "YOUR CHOICE · TAP TO SWITCH BACK"}
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
