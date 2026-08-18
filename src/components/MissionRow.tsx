import { Quote } from "lucide-react";
import Link from "next/link";
import { AccentDot } from "@/components/ui/Eyebrow";
import { TRIGGERS } from "@/content/triggers";
import type { Mission, MissionStatus } from "@/lib/data/types";
import { cn, formatDate, formatTime } from "@/lib/utils";

const STATUS_LABEL: Record<MissionStatus, string> = {
  completed: "COMPLETED",
  active: "ACTIVE",
  ended: "ENDED",
};

const STATUS_CLASS: Record<MissionStatus, string> = {
  completed: "text-[var(--success)] border-[rgba(127,183,126,.4)]",
  active: "text-gold-300 border-[rgba(201,166,72,.45)]",
  ended: "text-ink-2 border-[var(--line)]",
};

export default function MissionRow({ mission }: { mission: Mission }) {
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

      <p className="mt-3 line-clamp-2 text-[17px] text-ink-0">
        {mission.action_text}
      </p>

      <div className="mt-3 flex items-center gap-3 text-[13px] text-ink-2">
        <span>
          {formatDate(mission.started_at)} · {formatTime(mission.started_at)}
        </span>
        {mission.reflection && (
          <span className="flex items-center gap-1">
            <Quote size={13} aria-hidden />
            Reflection
          </span>
        )}
      </div>
    </Link>
  );
}
