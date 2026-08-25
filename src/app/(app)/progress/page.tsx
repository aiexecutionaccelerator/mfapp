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
import { useAppData } from "@/lib/data/store";
import { currentPromise } from "@/lib/personalCode";
import { MISSION_COUNT, computeStats } from "@/lib/stats";

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

  const { missions, lessonResponses, error, refresh } = useAppData();

  useEffect(() => {
    if (!error) return;
    showToast("Couldn't load your progress.", { retry: () => void refresh() });
  }, [error, refresh, showToast]);

  if (!missions || !lessonResponses) {
    return (
      <main className="flex flex-1 items-center justify-center text-ink-2">
        <Spinner />
      </main>
    );
  }

  const stats = computeStats(missions);
  const complete = stats.missionsCompleted >= MISSION_COUNT;
  const promise = currentPromise(lessonResponses);

  return (
    <main className="pt-4 pb-8">
      <Headline>YOUR PROGRESS</Headline>

      <div className="mt-8 flex justify-center">
        <ProgressRing
          value={stats.missionsCompleted}
          max={MISSION_COUNT}
          label="MISSIONS COMPLETE"
        />
      </div>

      <p className="mt-6 text-center text-[15px] text-ink-1">
        Every completed action is evidence of the man you are becoming.
      </p>

      {complete && (
        <GlassCard className="mt-6 border-[rgba(201,166,72,.35)]">
          <Eyebrow tone="gold">30-DAY MISSION COMPLETE</Eyebrow>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-1">
            You completed thirty actions and created thirty pieces of evidence.
            The Mission Log remains open. Keep using Honor, Courage, and
            Commitment whenever you need them.
          </p>
          <div className="mt-5 space-y-2">
            <Button onClick={() => router.push("/home")}>
              LOG A NEW ACTION
            </Button>
            <Button
              variant="secondary"
              onClick={() => router.push("/personal-code")}
            >
              VIEW MY PERSONAL CODE
            </Button>
          </div>
        </GlassCard>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Stat label="Honor Proofs" value={stats.proofs.honor} />
        <Stat label="Courage Proofs" value={stats.proofs.courage} />
        <Stat label="Commitment Proofs" value={stats.proofs.commitment} />
        <Stat label="Total Proofs" value={stats.totalProofs} />
        <Stat
          label="Missions Completed"
          value={`${stats.missionsCompleted}/${MISSION_COUNT}`}
        />
        <Stat label="Actions In Progress" value={stats.actionsInProgress} />
      </div>

      <GlassCard className="mt-6">
        <Eyebrow tone="gold">THE PROMISE I AM KEEPING</Eyebrow>
        {promise ? (
          <p className="mt-3 text-[17px] leading-snug text-ink-0">{promise}</p>
        ) : (
          <p className="mt-3 text-[15px] text-ink-1">
            Define the promise that matters most in Mission 12.
          </p>
        )}
        <div className="mt-5">
          {promise ? (
            <Button
              variant="secondary"
              onClick={() => router.push("/personal-code")}
            >
              VIEW MY PERSONAL CODE
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={() => router.push("/missions/12")}
            >
              OPEN MISSION 12
            </Button>
          )}
        </div>
      </GlassCard>

      {!complete && (
        <button
          type="button"
          onClick={() => router.push("/personal-code")}
          className="mt-4 flex min-h-12 w-full items-center justify-center text-[15px] text-gold-300"
        >
          View my Personal Code
        </button>
      )}
    </main>
  );
}
