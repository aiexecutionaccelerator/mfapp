import { TRIGGERS, TRIGGER_ACCENTS, TRIGGER_ORDER } from "@/content/triggers";
import type { Stats } from "@/lib/stats";
import { MISSION_COUNT } from "@/lib/stats";
import type { Trigger } from "@/lib/data/types";

/**
 * The scoreboard counts every deed exactly once: the three trigger columns
 * are free-form actions, MISSIONS is the structured x/30 — together they sum
 * to the Action Proofs total on the Progress ring.
 */
type ProofKey = Trigger | "missions";

const ORDER: ProofKey[] = [...TRIGGER_ORDER, "missions"];

function accentFor(key: ProofKey): { color: string; edge: string | null } {
  if (key === "missions") return { color: "var(--gold-500)", edge: null };
  return TRIGGER_ACCENTS[key];
}

function labelFor(key: ProofKey): string {
  return key === "missions" ? "MISSIONS" : TRIGGERS[key].name;
}

/** One column: dot + numeral over its label. */
export function ProofStat({
  proofKey,
  value,
}: {
  proofKey: ProofKey;
  value: string | number;
}) {
  const accent = accentFor(proofKey);
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1.5">
        <span
          aria-hidden
          className="inline-block h-2 w-2 shrink-0 rounded-full"
          style={{
            background: accent.color,
            boxShadow: accent.edge ? `0 0 0 1px ${accent.edge}` : undefined,
          }}
        />
        <p className="font-display text-[22px] leading-none text-ink-0">
          {value}
        </p>
      </div>
      {/* 12px so COMMITMENT fits four-up at 375px — the same floor the
          tab bar uses. */}
      <p className="mt-1.5 text-[12px] leading-none tracking-[0.02em] whitespace-nowrap text-ink-2 uppercase">
        {labelFor(proofKey)}
      </p>
    </div>
  );
}

/** One glass row: Honor · Courage · Commitment (free-form) · Missions x/30. */
export default function ProofCounts({ stats }: { stats: Stats }) {
  return (
    <div className="glass flex items-start justify-between gap-2 rounded-[14px] px-4 py-3">
      {ORDER.map((key) => (
        <ProofStat
          key={key}
          proofKey={key}
          value={
            key === "missions"
              ? `${stats.missionsCompleted}/${MISSION_COUNT}`
              : stats.freeform[key]
          }
        />
      ))}
    </div>
  );
}
