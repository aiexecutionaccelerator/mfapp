"use client";

import { Check, ChevronRight, Play } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import BuyRow from "@/components/BuyRow";
import HelpSheet from "@/components/HelpSheet";
import Button from "@/components/ui/Button";
import Eyebrow, { AccentDot } from "@/components/ui/Eyebrow";
import GlassCard from "@/components/ui/GlassCard";
import Headline from "@/components/ui/Headline";
import Spinner from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { MISSIONS, type MissionDef } from "@/content/missions";
import { TRIGGERS } from "@/content/triggers";
import { track } from "@/lib/analytics";
import { useAppData, store } from "@/lib/data/store";
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
}: {
  mission: MissionDef;
  status: RowStatus;
}) {
  return (
    <Link href={`/missions/${mission.number}`} className="block">
      <div
        className={cn(
          "glass flex items-center gap-3 rounded-[14px] px-4 py-4",
          status === "in_progress" && "border-[var(--gold-500)]",
          status === "completed" && "border-[rgba(201,166,72,.35)]",
        )}
      >
        <span className="min-w-0 flex-1">
          <span className="eyebrow block text-gold-300">
            MISSION {mission.number}
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

  const statusFor = (n: number): RowStatus =>
    completed.has(n)
      ? "completed"
      : inProgress.has(n)
        ? "in_progress"
        : "not_started";

  return (
    <main className="pt-4">
      <div className="flex items-start justify-between gap-2">
        <Headline>YOUR 30-DAY MISSION</Headline>
        <HelpSheet />
      </div>
      <p className="mt-4 text-[15px] leading-relaxed text-ink-1">
        Thirty numbered Missions. Move in order or open whichever you need
        today — for a quick one-off, take an Action from Start instead.
      </p>
      <p className="mt-3 text-[13px] text-ink-2">
        {stats.missionsCompleted} of {MISSION_COUNT} Missions completed ·{" "}
        {stats.totalProofs} {stats.totalProofs === 1 ? "proof" : "proofs"} logged
      </p>

      {profile.set_status === "ordered" && (
        <GlassCard className="mt-5 border-[rgba(201,166,72,.35)] p-4">
          <p className="text-[15px] leading-snug text-ink-1">
            Your set is on the way. Explore your Mission now, then begin
            Mission 1 when it arrives.
          </p>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => {
              void store
                .updateProfile({ set_status: "arrived" })
                .then(() => track("set_marked_arrived"))
                .catch(() => showToast("Couldn't save that. Please try again."));
            }}
          >
            MY SET HAS ARRIVED
          </Button>
        </GlassCard>
      )}

      {/* Keyed by target so the Continue card remounts as progress moves —
          never an in-place text swap inside a glass card (iOS Safari). */}
      <GlassCard
        key={continueMission?.number ?? "complete"}
        className="mt-6 border-[rgba(201,166,72,.35)]"
      >
        {continueMission ? (
          <>
            <Eyebrow tone="gold">CONTINUE</Eyebrow>
            <p className="mt-2 text-[17px] leading-snug text-ink-0">
              MISSION {continueMission.number} · {continueMission.title}
            </p>
            <Link href={`/missions/${continueMission.number}`} className="mt-5 block">
              <Button>OPEN MISSION</Button>
            </Link>
          </>
        ) : (
          <>
            <Eyebrow tone="gold">30-DAY MISSION COMPLETE</Eyebrow>
            <p className="mt-2 text-[17px] leading-relaxed text-ink-1">
              Thirty actions. Thirty pieces of evidence. The Mission Log stays
              open.
            </p>
            <Link href="/home" className="mt-5 block">
              <Button>START A NEW ACTION</Button>
            </Link>
          </>
        )}
      </GlassCard>

      <div className="mt-6 space-y-3">
        {/* Mission 0 — the guide. Read it any time; it never needs completing. */}
        <Link href="/using-your-set" className="block">
          <div className="glass flex items-center gap-3 rounded-[14px] px-4 py-4">
            <span className="min-w-0 flex-1">
              <span className="eyebrow block text-gold-300">
                MISSION 0 · THE GUIDE
              </span>
              <span className="mt-1.5 block text-[17px] leading-snug text-ink-0">
                Using Your Mission Fragrances Set
              </span>
              <span className="mt-1.5 block text-[13px] text-ink-2">
                How to wear it, spray it, and care for it
              </span>
            </span>
            <ChevronRight aria-hidden className="shrink-0 text-ink-2" size={20} />
          </div>
        </Link>

        {MISSIONS.map((mission) => (
          <MissionCard
            key={mission.number}
            mission={mission}
            status={statusFor(mission.number)}
          />
        ))}
      </div>

      <BuyRow />
    </main>
  );
}
