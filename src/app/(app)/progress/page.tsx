"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import GlassCard from "@/components/ui/GlassCard";
import Headline from "@/components/ui/Headline";
import ProgressRing from "@/components/ui/ProgressRing";
import Spinner from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import {
  CHALLENGE_LENGTH,
  challengeDay,
  getMode,
  getPhase,
  rawChallengeDay,
} from "@/lib/challenge";
import { data } from "@/lib/data";
import type { Mission, Profile } from "@/lib/data/types";
import { computeStats } from "@/lib/stats";

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="glass rounded-[14px] p-4">
      <p className="font-display text-[40px] leading-none text-ink-0">{value}</p>
      <p className="eyebrow mt-2 text-ink-2">{label}</p>
    </div>
  );
}

export default function ProgressPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [missions, setMissions] = useState<Mission[] | null>(null);

  const load = useCallback(
    async function run(): Promise<void> {
      try {
        const [nextProfile, nextMissions] = await Promise.all([
          data.getProfile(),
          data.listMissions(),
        ]);
        setProfile(nextProfile);
        setMissions(nextMissions);
      } catch {
        showToast("Couldn't load your progress.", { retry: () => void run() });
      }
    },
    [showToast],
  );

  useEffect(() => {
    void load();
  }, [load]);

  if (!profile || !missions) {
    return (
      <main className="flex flex-1 items-center justify-center text-ink-2">
        <Spinner />
      </main>
    );
  }

  const stats = computeStats(missions);
  const mode = getMode(profile);
  const day = challengeDay(profile);
  const phase = getPhase(day);

  if (mode === "log") {
    return (
      <main className="pt-4">
        <Headline>BUILD THE EVIDENCE</Headline>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Stat label="Honor Reps" value={stats.reps.honor} />
          <Stat label="Courage Reps" value={stats.reps.courage} />
          <Stat label="Commitment Reps" value={stats.reps.commitment} />
          <Stat label="Missions Completed" value={stats.completed} />
          <Stat label="Completed · last 30 days" value={stats.last30DaysCompleted} />
        </div>
      </main>
    );
  }

  const canComplete =
    rawChallengeDay(profile) >= CHALLENGE_LENGTH && !profile.challenge_completed_at;

  return (
    <main className="pt-4">
      <Headline>YOUR 30-DAY MISSION</Headline>

      <div className="mt-8 flex justify-center">
        <ProgressRing value={day} max={CHALLENGE_LENGTH} />
      </div>

      <GlassCard className="mt-8">
        <Eyebrow tone="gold">
          PHASE {phase.phase} · {phase.title}
        </Eyebrow>
        <p className="mt-3 text-[15px] text-ink-1">{phase.body}</p>
      </GlassCard>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Stat label="Honor Reps" value={stats.reps.honor} />
        <Stat label="Courage Reps" value={stats.reps.courage} />
        <Stat label="Commitment Reps" value={stats.reps.commitment} />
        <Stat label="Missions Started" value={stats.started} />
        <Stat label="Missions Completed" value={stats.completed} />
        {stats.followThroughRate !== null && (
          <Stat
            label="Follow-Through Rate"
            value={`${Math.round(stats.followThroughRate * 100)}%`}
          />
        )}
      </div>

      {canComplete && (
        <div className="mt-8">
          <Button onClick={() => router.push("/challenge-complete")}>
            COMPLETE THE 30-DAY MISSION
          </Button>
        </div>
      )}
    </main>
  );
}
