import BottleVisual from "@/components/BottleVisual";
import { TRIGGERS, TRIGGER_ACCENTS } from "@/content/triggers";
import type { Trigger } from "@/lib/data/types";
import { cn } from "@/lib/utils";

/**
 * The fragrance a Mission calls for — the bottle itself, not a line of text.
 *
 * It also carries the T of S.T.A.R. When the ritual screen was folded away,
 * "spray it and recall a moment you lived this" lost its home; this is where
 * it belongs, on the screen he is looking at while he sprays.
 *
 * The bottle stands slightly proud of the card with its own pool of light
 * beneath it, so the product reads as an object on a shelf rather than an
 * icon in a row.
 */
export default function FragranceCue({
  trigger,
  className,
}: {
  trigger: Trigger;
  className?: string;
}) {
  const meta = TRIGGERS[trigger];
  const tone = TRIGGER_ACCENTS[trigger];

  return (
    <div
      className={cn(
        "glass relative flex items-stretch gap-4 overflow-hidden rounded-[20px] py-4 pr-5 pl-4",
        className,
      )}
      style={{
        boxShadow: `inset 0 1px 0 rgba(255,255,255,.06), 0 10px 30px rgba(0,0,0,.35), 0 0 40px ${tone.glow}`,
      }}
    >
      {/* The value's own colour down the edge. */}
      <span
        aria-hidden
        className="absolute top-0 bottom-0 left-0 w-[2px]"
        style={{
          background: tone.color,
          boxShadow: tone.edge ? `1px 0 0 ${tone.edge}` : undefined,
        }}
      />
      {/* A wash of that colour behind the bottle, falling off to nothing. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-6 -left-6 h-40 w-40 rounded-full"
        style={{
          background: `radial-gradient(circle, ${tone.glow} 0%, transparent 68%)`,
        }}
      />

      <div className="relative flex w-[62px] shrink-0 items-end justify-center">
        <BottleVisual trigger={trigger} size={54} />
        {/* The pool of light the bottle stands in. */}
        <span
          aria-hidden
          className="absolute bottom-0 left-1/2 h-[7px] w-[52px] -translate-x-1/2 rounded-full"
          style={{
            background: `radial-gradient(ellipse, ${tone.glow} 0%, transparent 72%)`,
          }}
        />
      </div>

      <div className="relative min-w-0 flex-1 self-center">
        <p className="eyebrow text-ink-2">WEAR THIS FOR MISSION</p>
        <p
          className="font-display mt-1.5 text-[26px] leading-none"
          style={{
            color: trigger === "commitment" ? "var(--ink-0)" : tone.color,
          }}
        >
          {meta.name}
        </p>
        <p className="mt-2 text-[13px] leading-snug text-ink-1">
          {meta.starRecall}
        </p>
      </div>
    </div>
  );
}
