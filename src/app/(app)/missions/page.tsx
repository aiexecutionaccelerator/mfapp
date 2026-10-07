"use client";

import { Check, ChevronRight, Play } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Eyebrow, { AccentDot } from "@/components/ui/Eyebrow";
import Headline from "@/components/ui/Headline";
import Spinner from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { MISSIONS, type MissionDef } from "@/content/missions";
import { TRIGGERS } from "@/content/triggers";
import { track } from "@/lib/analytics";
import { useAppData } from "@/lib/data/store";
import {
  MISSION_COUNT,
  computeStats,
  missionNumbersWithStatus,
  nextMissionNumber,
} from "@/lib/stats";
import { cn } from "@/lib/utils";

type RowStatus = "not_started" | "in_progress" | "completed";

function MissionCard({
  mission,
  status,
  next = false,
}: {
  mission: MissionDef;
  status: RowStatus;
  next?: boolean;
}) {
  return (
    <Link href={`/missions/${mission.number}`} className="block">
      <div
        className={cn(
          "glass flex items-center gap-3 rounded-[14px] px-4 py-4",
          (status === "in_progress" || next) && "border-[var(--gold-500)]",
          status === "completed" && "border-[rgba(201,166,72,.35)]",
        )}
      >
        <span className="min-w-0 flex-1">
          <span className="eyebrow block text-gold-300">
            {next && status !== "in_progress" ? "NEXT · " : ""}MISSION{" "}
            {mission.number}
          </span>
          <span className="mt-1.5 block text-[17px] leading-snug text-ink-0">
            {mission.title}
          </span>
          <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-2">
            {mission.recommendedTrigger ? (
              <span className="flex items-center gap-2">
                <AccentDot trigger={mission.recommendedTrigger} />
                <span>{TRIGGERS[mission.recommendedTrigger].name}</span>
              </span>
            ) : (
              <span>YOU CHOOSE THE VALUE</span>
            )}
            {status === "in_progress" && (
              <span className="text-gold-300">IN PROGRESS</span>
            )}
            {status === "completed" && (
              <span className="text-[var(--success)]">COMPLETE</span>
            )}
            {status === "not_started" && <span>NOT STARTED</span>}
            {mission.youtubeId && (
              <span className="flex items-center gap-1">
                <Play size={12} aria-hidden />
                Video
              </span>
            )}
          </span>
        </span>
        {status === "completed" ? (
          <Check
            aria-label="Completed"
            size={20}
            className="shrink-0 text-gold-300"
          />
        ) : (
          <ChevronRight aria-hidden className="shrink-0 text-ink-2" size={20} />
        )}
      </div>
    </Link>
  );
}

export default function MissionListPage() {
  const { showToast } = useToast();
  const { profile, missions, error, refresh } = useAppData();

  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    track("mission_list_opened");
  }, []);

  useEffect(() => {
    if (!error) return;
    showToast("Couldn't load your Missions.", { retry: () => void refresh() });
  }, [error, refresh, showToast]);

  if (!missions || !profile) {
    return (
      <main className="flex flex-1 items-center justify-center text-ink-2">
        <Spinner />
      </main>
    );
  }

  const stats = computeStats(missions);
  const inProgress = missionNumbersWithStatus(missions, "active");
  const completed = missionNumbersWithStatus(missions, "completed");

  // Continue: an in-progress Mission first, else the lowest incomplete.
  const continueNumber =
    inProgress.size > 0 ? Math.min(...inProgress) : nextMissionNumber(missions);
  const continueMission = MISSIONS.find((m) => m.number === continueNumber);

  // The next Mission, then the two after it — the page opens short.
  const upcoming = MISSIONS.filter(
    (m) => m.number !== continueNumber && !completed.has(m.number),
  ).slice(0, 2);
  const visible = showAll
    ? MISSIONS
    : continueMission
      ? [continueMission, ...upcoming]
      : upcoming;

  const statusFor = (n: number): RowStatus =>
    completed.has(n)
      ? "completed"
      : inProgress.has(n)
        ? "in_progress"
        : "not_started";

  return (
    <main className="pt-4">
      <Headline>YOUR 30-DAY MISSION</Headline>
      <p className="mt-4 text-[15px] leading-relaxed text-ink-1">
        Thirty numbered Missions. Move in order or open whichever you need
        today — for a quick one-off, take an Action from Start instead.
      </p>
      <p className="mt-3 text-[13px] text-ink-2">
        {stats.missionsCompleted} of {MISSION_COUNT} Missions completed ·{" "}
        {stats.totalProofs} {stats.totalProofs === 1 ? "proof" : "proofs"} logged
      </p>

      {profile.set_status === "ordered" && (
        <p className="mt-5 text-[15px] leading-snug text-gold-300">
          Your set is on the way. Read ahead now — Start has the button for the
          day it lands.
        </p>
      )}

      {continueMission === undefined && (
        <p className="mt-6 text-[17px] leading-relaxed text-ink-1">
          Thirty actions. Thirty pieces of evidence. Your Proof Log stays open.
        </p>
      )}

      {/* Progressive: what's next, not a wall of thirty — and the next Mission
          is the first card here rather than a second Continue card above it.
          Everything stays one tap away; nothing is locked. */}
      <section className="mt-7">
        <Eyebrow>{showAll ? "ALL MISSIONS" : "WHAT'S NEXT"}</Eyebrow>
        <div className="mt-3 space-y-2.5">
          {visible.map((mission) => (
            <MissionCard
              key={mission.number}
              mission={mission}
              status={statusFor(mission.number)}
              next={mission.number === continueNumber}
            />
          ))}
        </div>
        <Button
          variant="ghost"
          className="mt-4"
          onClick={() => setShowAll((value) => !value)}
        >
          {showAll ? "SHOW LESS" : `SHOW ALL ${MISSION_COUNT} MISSIONS`}
        </Button>
      </section>

    </main>
  );
}
