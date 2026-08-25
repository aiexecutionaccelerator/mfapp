import { TRIGGERS, TRIGGER_ACCENTS, TRIGGER_ORDER } from "@/content/triggers";
import type { Stats } from "@/lib/stats";
import type { Trigger } from "@/lib/data/types";

type ProofKey = Trigger | "total";

const ORDER: ProofKey[] = [...TRIGGER_ORDER, "total"];

function accentFor(key: ProofKey): { color: string; edge: string | null } {
  if (key === "total") return { color: "var(--gold-500)", edge: null };
  return TRIGGER_ACCENTS[key];
}

function labelFor(key: ProofKey): string {
  return key === "total" ? "TOTAL" : TRIGGERS[key].name;
}

/** One proof column: dot + numeral over its label. Reused by the Log summary. */
export function ProofStat({
  proofKey,
  value,
}: {
  proofKey: ProofKey;
  value: number;
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

/** One glass row, four small columns: Honor · Courage · Commitment · Total. */
export default function ProofCounts({ stats }: { stats: Stats }) {
  return (
    <div className="glass flex items-start justify-between gap-2 rounded-[14px] px-4 py-3">
      {ORDER.map((key) => (
        <ProofStat
          key={key}
          proofKey={key}
          value={key === "total" ? stats.totalProofs : stats.proofs[key]}
        />
      ))}
    </div>
  );
}
