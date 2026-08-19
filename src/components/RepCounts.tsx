import { TRIGGERS, TRIGGER_ACCENTS } from "@/content/triggers";
import { REP_ORDER, type RepKey } from "@/lib/stats";

/** Course reps carry the gold accent; the three triggers carry the bottles'. */
function accentFor(key: RepKey): { color: string; edge: string | null } {
  if (key === "course") return { color: "var(--gold-500)", edge: null };
  return TRIGGER_ACCENTS[key];
}

function labelFor(key: RepKey): string {
  return key === "course" ? "COURSE" : TRIGGERS[key].name;
}

export default function RepCounts({ reps }: { reps: Record<RepKey, number> }) {
  return (
    /* Four equal columns can't hold COMMITMENT at a legible size on a 375px
       screen, so the columns take their own width and spread instead. */
    <div className="flex items-start justify-between gap-2">
      {REP_ORDER.map((key) => {
        const accent = accentFor(key);
        return (
          <div key={key} className="text-center">
            <div className="flex items-center justify-center gap-1.5">
              <span
                aria-hidden
                className="inline-block h-2 w-2 shrink-0 rounded-full"
                style={{
                  background: accent.color,
                  boxShadow: accent.edge ? `0 0 0 1px ${accent.edge}` : undefined,
                }}
              />
              <p className="font-display text-[38px] leading-none text-ink-0">
                {reps[key]}
              </p>
            </div>
            {/* 12px so COMMITMENT fits four-up at 375px — the same floor the
                tab bar uses. */}
            <p className="mt-2 text-[12px] leading-none tracking-[0.02em] whitespace-nowrap text-ink-2 uppercase">
              {labelFor(key)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
