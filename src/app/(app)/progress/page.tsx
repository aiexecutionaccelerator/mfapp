"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
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
  getModule,
  rawChallengeDay,
} from "@/lib/challenge";
import { LESSON_COUNT } from "@/content/course";
import { useAppData } from "@/lib/data/store";
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

  const { profile, missions, courseProgress, error, refresh } = useAppData();

  useEffect(() => {
    if (!error) return;
    showToast("Couldn't load your progress.", { retry: () => void refresh() });
  }, [error, refresh, showToast]);

  if (!profile || !missions || !courseProgress) {
    return (
      <main className="flex flex-1 items-center justify-center text-ink-2">
        <Spinner />
      </main>
    );
  }

  const stats = computeStats(missions, courseProgress);
  const mode = getMode(profile);
  const day = challengeDay(profile);
  const courseModule = getModule(day);

  if (mode === "log") {
    return (
      <main className="pt-4">
        <Headline>BUILD THE EVIDENCE</Headline>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Stat label="Honor Reps" value={stats.reps.honor} />
          <Stat label="Courage Reps" value={stats.reps.courage} />
          <Stat label="Commitment Reps" value={stats.reps.commitment} />
          <Stat label="Course Reps" value={stats.reps.course} />
          <Stat label="Missions Completed" value={stats.completed} />
          <Stat label="Completed · last 30 days" value={stats.last30DaysCompleted} />
          <Stat
            label="Lessons completed"
            value={`${stats.lessonsCompleted}/${LESSON_COUNT}`}
          />
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
          MODULE {courseModule.module} · {courseModule.title}
        </Eyebrow>
        <p className="mt-3 text-[15px] text-ink-1">{courseModule.body}</p>
      </GlassCard>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Stat label="Honor Reps" value={stats.reps.honor} />
        <Stat label="Courage Reps" value={stats.reps.courage} />
        <Stat label="Commitment Reps" value={stats.reps.commitment} />
        <Stat label="Course Reps" value={stats.reps.course} />
        <Stat label="Missions Started" value={stats.started} />
        <Stat label="Missions Completed" value={stats.completed} />
        <Stat
          label="Lessons completed"
          value={`${stats.lessonsCompleted}/${LESSON_COUNT}`}
        />
        {stats.followThroughRate !== null && (
          <Stat
            label="Follow-Through Rate"
            value={`${Math.round(stats.followThroughRate * 100)}%`}
          />
        )}
      </div>

      {stats.followThroughRate !== null && (
        <p className="mt-3 text-[13px] text-ink-2">
          Follow-Through Rate = completed ÷ (completed + ended).
        </p>
      )}

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
