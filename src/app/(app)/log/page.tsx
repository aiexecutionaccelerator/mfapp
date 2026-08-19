"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MissionRow from "@/components/MissionRow";
import { RepStat } from "@/components/RepCounts";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Eyebrow from "@/components/ui/Eyebrow";
import GlassCard from "@/components/ui/GlassCard";
import Headline from "@/components/ui/Headline";
import Pill from "@/components/ui/Pill";
import ProgressRing from "@/components/ui/ProgressRing";
import Spinner from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { TRIGGER_ORDER } from "@/content/triggers";
import {
  CHALLENGE_LENGTH,
  challengeDay,
  getMode,
  getModule,
  rawChallengeDay,
} from "@/lib/challenge";
import { useAppData } from "@/lib/data/store";
import type { Trigger } from "@/lib/data/types";
import { REP_ORDER, computeStats } from "@/lib/stats";

type Filter = "all" | Trigger;

const FILTERS: Filter[] = ["all", ...TRIGGER_ORDER];

export default function LogPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const { profile, missions, courseProgress, error, refresh } = useAppData();
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    if (!error) return;
    showToast("Couldn't load your Mission Log.", {
      retry: () => void refresh(),
    });
  }, [error, refresh, showToast]);

  const visible =
    missions?.filter((m) => filter === "all" || m.trigger === filter) ?? [];

  const summary =
    profile && missions && courseProgress
      ? {
          stats: computeStats(missions, courseProgress),
          mode: getMode(profile),
          day: challengeDay(profile),
          module: getModule(challengeDay(profile)),
          canComplete:
            rawChallengeDay(profile) >= CHALLENGE_LENGTH &&
            !profile.challenge_completed_at,
        }
      : null;

  return (
    <main className="pt-4">
      <Headline>MISSION LOG</Headline>

      {/* One block holds the whole scoreboard: where you are, and the proof. */}
      {summary && (
        <GlassCard className="mt-5">
          {summary.mode === "log" ? (
            <>
              <Eyebrow>BUILD THE EVIDENCE</Eyebrow>
              <div className="mt-4 flex items-start justify-between gap-2">
                {REP_ORDER.map((key) => (
                  <RepStat
                    key={key}
                    repKey={key}
                    value={summary.stats.reps[key]}
                  />
                ))}
              </div>
              <p className="mt-4 text-[13px] text-ink-2">
                Total completed {summary.stats.completed} · Last 30 days{" "}
                {summary.stats.last30DaysCompleted}
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <ProgressRing
                  value={summary.day}
                  max={CHALLENGE_LENGTH}
                  size={104}
                />
                <div className="grid min-w-0 flex-1 grid-cols-2 gap-x-2 gap-y-3">
                  {REP_ORDER.map((key) => (
                    <RepStat
                      key={key}
                      repKey={key}
                      value={summary.stats.reps[key]}
                    />
                  ))}
                </div>
              </div>
              <p className="mt-4 text-[13px] text-ink-2">
                Missions started {summary.stats.started} · Completed{" "}
                {summary.stats.completed}
                {summary.stats.followThroughRate !== null && (
                  <>
                    {" · "}Follow-through{" "}
                    {Math.round(summary.stats.followThroughRate * 100)}%
                  </>
                )}
              </p>
              <p className="eyebrow mt-2 text-ink-2">
                MODULE {summary.module.module} · {summary.module.title}
              </p>
            </>
          )}
        </GlassCard>
      )}

      {summary?.canComplete && (
        <div className="mt-5">
          <Button onClick={() => router.push("/challenge-complete")}>
            COMPLETE THE 30-DAY MISSION
          </Button>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        {FILTERS.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
            className="flex min-h-12 items-center"
          >
            <Pill active={filter === value}>{value.toUpperCase()}</Pill>
          </button>
        ))}
      </div>

      {!missions ? (
        <div className="mt-10 flex justify-center text-ink-2">
          <Spinner />
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No Missions yet."
            body="Start with one action today."
            action={
              <Button onClick={() => router.push("/home")}>
                START A MISSION
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {visible.map((mission) => (
            <MissionRow key={mission.id} mission={mission} />
          ))}
        </div>
      )}
    </main>
  );
}
