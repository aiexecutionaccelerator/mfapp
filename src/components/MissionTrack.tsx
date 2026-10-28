import { MISSIONS } from "@/content/missions";
import { cn } from "@/lib/utils";

/**
 * The 30 Missions as one track of segments, grouped by stage: gold where a
 * Mission is done, a lit outline on the next one. Reads at a glance, like a
 * rank bar. `fresh` marks a Mission just completed so it lands with a flash.
 */
export default function MissionTrack({
  completed,
  next,
  fresh,
  className,
}: {
  completed: Set<number>;
  next: number | null;
  fresh?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("flex items-end gap-[3px]", className)}
      role="img"
      aria-label={`${completed.size} of 30 Missions complete`}
    >
      {MISSIONS.map((m, i) => {
        const done = completed.has(m.number);
        const stageStart = i > 0 && MISSIONS[i - 1].stage !== m.stage;
        return (
          <span
            key={m.number}
            className={cn(
              "h-2 flex-1 rounded-[2px] transition-colors duration-500",
              stageStart && "ml-1.5",
              done
                ? "bg-gold-gradient shadow-[0_0_6px_rgba(212,175,55,.35)]"
                : m.number === next
                  ? "track-next border border-[var(--gold-500)]"
                  : "bg-[rgba(245,241,232,.09)]",
              m.number === fresh && "track-fresh",
            )}
            style={{ animationDelay: `${i * 18}ms` }}
          />
        );
      })}
    </div>
  );
}
