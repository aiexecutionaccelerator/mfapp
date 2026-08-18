import { AccentDot } from "@/components/ui/Eyebrow";
import { TRIGGERS, TRIGGER_ORDER } from "@/content/triggers";
import type { Trigger } from "@/lib/data/types";

export default function RepCounts({
  reps,
}: {
  reps: Record<Trigger, number>;
}) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {TRIGGER_ORDER.map((trigger) => (
        <div key={trigger} className="text-center">
          <p className="font-display text-[44px] leading-none text-ink-0">
            {reps[trigger]}
          </p>
          <p className="eyebrow mt-2 flex items-center justify-center gap-1.5 text-ink-2">
            <AccentDot trigger={trigger} />
            <span>{TRIGGERS[trigger].name}</span>
          </p>
        </div>
      ))}
    </div>
  );
}
