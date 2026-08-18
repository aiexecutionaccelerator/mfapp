import type { Mode } from "@/lib/challenge";
import { CHALLENGE_LENGTH } from "@/lib/challenge";

export default function DayBadge({ mode, day }: { mode: Mode; day: number }) {
  const label =
    mode === "log" ? "YOUR MISSION CONTINUES" : `DAY ${day} OF ${CHALLENGE_LENGTH}`;

  return (
    <span className="glass eyebrow rounded-full px-3 py-2 text-gold-300">
      {label}
    </span>
  );
}
