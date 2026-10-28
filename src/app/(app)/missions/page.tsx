"use client";

import { Check, ChevronRight, Play } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import FragranceTrio from "@/components/FragranceTrio";
import Button from "@/components/ui/Button";
import Eyebrow, { AccentDot } from "@/components/ui/Eyebrow";
import Headline from "@/components/ui/Headline";
import Spinner from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import Wordmark from "@/components/Wordmark";
import { MISSIONS, STAGES, type MissionDef } from "@/content/missions";
import { TRIGGERS } from "@/content/triggers";
import { track } from "@/lib/analytics";
import { useAppData } from "@/lib/data/store";
import {
  MISSION_COUNT,
  completedMissionNumbers,
  computeStats,
  nextMissionNumber,
} from "@/lib/stats";
import { cn } from "@/lib/utils";

function MissionCard({
  mission,
  complete,
  drafted,
  next = false,
}: {
  mission: MissionDef;
  complete: boolean;
  drafted: boolean;
  next?: boolean;
}) {
  return (
    <Link href={`/missions/${mission.number}`} className="block">
      <div
        className={cn(
          "glass flex items-center gap-3 rounded-[14px] px-4 py-4",
          next && "border-[var(--gold-500)]",
          complete && "border-[rgba(201,166,72,.35)]",
        )}
      >
        <span className="min-w-0 flex-1">
          <span className="eyebrow block text-gold-300">
            {next ? "NEXT · " : ""}MISSION {mission.number}
          </span>
          <span className="mt-1.5 block text-[17px] leading-snug text-ink-0">
            {mission.title}
          </span>
          <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-2">
            <span className="flex items-center gap-2">
              <AccentDot trigger={mission.recommendedTrigger} />
              <span>{TRIGGERS[mission.recommendedTrigger].name}</span>
            </span>
            {complete ? (
              <span className="text-[var(--success)]">COMPLETE</span>
            ) : drafted ? (
              <span className="text-gold-300">DRAFT SAVED</span>
            ) : (
              <span>NOT STARTED</span>
            )}
            <span>{mission.time}</span>
            {mission.youtubeId && (
              <span className="flex items-center gap-1">
                <Play size={12} aria-hidden />
                Video
              </span>
            )}
          </span>
        </span>
        {complete ? (
          <Check aria-label="Completed" size={20} className="shrink-0 text-gold-300" />
        ) : (
          <ChevronRight aria-hidden className="shrink-0 text-ink-2" size={20} />
        )}
      </div>
    </Link>
  );
}

/** The home of the app: the thirty Missions, and one door out to a one-off. */
export default function MissionListPage() {
  const { showToast } = useToast();
  const { profile, missions, drafts, error, refresh } = useAppData();

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
  const completed = completedMissionNumbers(missions);
  const drafted = new Set((drafts ?? []).map((d) => d.mission_number));
  const continueNumber = nextMissionNumber(missions);
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

  return (
    <main className="pt-4">
      <div className="flex items-center justify-between gap-2">
        <Wordmark />
        {stats.missionsCompleted > 0 && (
          <span className="glass eyebrow shrink-0 rounded-full px-3 py-2 text-gold-300">
            {stats.missionsCompleted}/{MISSION_COUNT} COMPLETE
          </span>
        )}
      </div>

      <Headline className="mt-6">YOUR 30-DAY MISSION</Headline>
      <p className="mt-4 text-[15px] leading-relaxed text-ink-1">
        30 Missions, one a day. Each builds on the last. Miss a day and nothing
        resets. Pick up at the next one.
      </p>

      {profile.set_status === "ordered" && (
        <p className="mt-4 text-[15px] leading-snug text-gold-300">
          Your set is on the way. Start when it gets here.
        </p>
      )}

      {!continueMission && (
        <p className="mt-6 text-[17px] leading-relaxed text-ink-1">
          All 30 Missions done. Your Proof Log stays open.
        </p>
      )}

      {/* Progressive: what's next, not a wall of thirty. Everything stays one
          tap away; nothing is locked. */}
      <section className="mt-7">
        {showAll ? (
          // All thirty, in their four stages. Nothing is locked.
          Object.values(STAGES).map((stage) => (
            <div key={stage.label} className="mb-6">
              <Eyebrow>
                {stage.label} · {stage.range[0]}–{stage.range[1]}
              </Eyebrow>
              <div className="mt-3 space-y-2.5">
                {visible
                  .filter(
                    (m) => m.number >= stage.range[0] && m.number <= stage.range[1],
                  )
                  .map((mission) => (
                    <MissionCard
                      key={mission.number}
                      mission={mission}
                      complete={completed.has(mission.number)}
                      drafted={drafted.has(mission.number)}
                      next={mission.number === continueNumber}
                    />
                  ))}
              </div>
            </div>
          ))
        ) : (
          <>
            <Eyebrow>WHAT&apos;S NEXT</Eyebrow>
            <div className="mt-3 space-y-2.5">
              {visible.map((mission) => (
                <MissionCard
                  key={mission.number}
                  mission={mission}
                  complete={completed.has(mission.number)}
                  drafted={drafted.has(mission.number)}
                  next={mission.number === continueNumber}
                />
              ))}
            </div>
          </>
        )}
        <Button
          variant="ghost"
          className="mt-4"
          onClick={() => setShowAll((value) => !value)}
        >
          {showAll ? "SHOW LESS" : `SHOW ALL ${MISSION_COUNT} MISSIONS`}
        </Button>
      </section>

      {/* The second door: something outside the thirty, any time. */}
      <Link href="/action/declare" className="mt-8 block">
        <div className="glass flex items-center gap-3 rounded-[14px] px-4 py-4">
          <span className="min-w-0 flex-1">
            <span className="eyebrow block text-gold-300">ONE-OFF ACTION</span>
            <span className="mt-1.5 block text-[15px] leading-snug text-ink-1">
              Something else? Log it here.
            </span>
          </span>
          <ChevronRight aria-hidden className="shrink-0 text-ink-2" size={20} />
        </div>
      </Link>

      <FragranceTrio />
    </main>
  );
}
