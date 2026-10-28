import { Camera } from "lucide-react";
import Link from "next/link";
import { AccentDot } from "@/components/ui/Eyebrow";
import { getMissionDef } from "@/content/missions";
import { getMissionDefV1 } from "@/content/missions-v1";
import { TRIGGERS } from "@/content/triggers";
import { KIND_LABELS, isLegacy, kindOf } from "@/lib/curriculum";
import type { Mission } from "@/lib/data/types";
import { cn, formatDate, formatTime } from "@/lib/utils";

/** The badge says what the record IS, so a plan never reads as a deed. */
function badge(mission: Mission): { label: string; className: string } {
  if (mission.removed_at)
    return { label: "REMOVED", className: "text-ink-2 border-[var(--line)]" };
  if (mission.status === "active")
    // Only rows left open by the old declare-then-record flow.
    return { label: "NOT LOGGED YET", className: "text-gold-300 border-[rgba(201,166,72,.45)]" };
  if (mission.status === "ended")
    return { label: "ENDED", className: "text-ink-2 border-[var(--line)]" };
  const kind = kindOf(mission);
  return {
    label: KIND_LABELS[kind].toUpperCase(),
    className:
      kind === "action"
        ? "text-[var(--success)] border-[rgba(127,183,126,.4)]"
        : "text-gold-300 border-[rgba(201,166,72,.45)]",
  };
}

/** The title a record was made under: an old record keeps its old task. */
export function recordTitle(mission: Mission): string {
  if (mission.mission_number === null) return "ONE-OFF ACTION";
  const def = isLegacy(mission)
    ? getMissionDefV1(mission.mission_number)
    : getMissionDef(mission.mission_number);
  return `MISSION ${mission.mission_number} · ${(def?.title ?? "").toUpperCase()}`;
}

/** One Proof card in the Proof Log — Missions and Actions alike. */
export default function MissionRow({ mission }: { mission: Mission }) {
  const when = mission.completed_at ?? mission.started_at;
  const { label, className } = badge(mission);

  return (
    <Link href={`/log/${mission.id}`} className="glass card-hover block rounded-[14px] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow flex items-center gap-2 text-ink-2">
          <AccentDot trigger={mission.trigger} />
          <span>{TRIGGERS[mission.trigger].name}</span>
        </p>
        <span className={cn("eyebrow rounded-full border px-2 py-1", className)}>
          {label}
        </span>
      </div>

      <p className="eyebrow mt-3 text-gold-300">{recordTitle(mission)}</p>
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
