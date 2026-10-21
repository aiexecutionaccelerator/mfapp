import { Camera } from "lucide-react";
import Link from "next/link";
import { AccentDot } from "@/components/ui/Eyebrow";
import { getMissionDef } from "@/content/missions";
import { TRIGGERS } from "@/content/triggers";
import type { Mission, MissionStatus } from "@/lib/data/types";
import { cn, formatDate, formatTime } from "@/lib/utils";

const STATUS_LABEL: Record<MissionStatus, string> = {
  completed: "COMPLETE",
  // Nothing creates these any more — only rows left open by the old
  // declare-then-record flow still read this way.
  active: "NOT LOGGED YET",
  ended: "ENDED",
};

const STATUS_CLASS: Record<MissionStatus, string> = {
  completed: "text-[var(--success)] border-[rgba(127,183,126,.4)]",
  active: "text-gold-300 border-[rgba(201,166,72,.45)]",
  ended: "text-ink-2 border-[var(--line)]",
};

/** One Proof card in the Proof Log — Missions and Actions alike. */
export default function MissionRow({ mission }: { mission: Mission }) {
  const def =
    mission.mission_number !== null
      ? getMissionDef(mission.mission_number)
      : undefined;
  const when = mission.completed_at ?? mission.started_at;

  return (
    <Link href={`/log/${mission.id}`} className="glass block rounded-[14px] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow flex items-center gap-2 text-ink-2">
          <AccentDot trigger={mission.trigger} />
          <span>{TRIGGERS[mission.trigger].name}</span>
        </p>
        <span
          className={cn(
            "eyebrow rounded-full border px-2 py-1",
            STATUS_CLASS[mission.status],
          )}
        >
          {STATUS_LABEL[mission.status]}
        </span>
      </div>

      <p className="eyebrow mt-3 text-gold-300">
        {def ? `MISSION ${def.number} · ${def.title.toUpperCase()}` : "ONE-OFF ACTION"}
      </p>
      {/* One entry, one sentence. Rows from the old declare-then-record flow
          kept two, so the declared half shows only when it differs. */}
      <p className="mt-1.5 line-clamp-3 text-[17px] text-ink-0">
        {mission.reflection ?? mission.action_text}
      </p>
      {mission.reflection !== null &&
        mission.action_text !== mission.reflection && (
          <p className="mt-1.5 line-clamp-1 text-[14px] leading-snug text-ink-2">
            Declared: {mission.action_text}
          </p>
        )}

      <div className="mt-3 flex items-center gap-3 text-[13px] text-ink-2">
        <span>
          {formatDate(when)} · {formatTime(when)}
        </span>
        {mission.photo_url && (
          <span className="flex items-center gap-1">
            <Camera size={13} aria-hidden />
            Photo
          </span>
        )}
      </div>
    </Link>
  );
}
