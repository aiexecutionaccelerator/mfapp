"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import BuyRow from "@/components/BuyRow";
import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import GlassCard from "@/components/ui/GlassCard";
import Headline from "@/components/ui/Headline";
import ProgressRing from "@/components/ui/ProgressRing";
import Spinner from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { useAppData } from "@/lib/data/store";
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

  const { missions, error, refresh } = useAppData();

  useEffect(() => {
    if (!error) return;
    showToast("Couldn't load your progress.", { retry: () => void refresh() });
  }, [error, refresh, showToast]);

  if (!missions) {
    return (
      <main className="flex flex-1 items-center justify-center text-ink-2">
        <Spinner />
      </main>
    );
  }

  const stats = computeStats(missions);
  const complete = stats.missionsCompleted >= MISSION_COUNT;

  return (
    <main className="pt-4 pb-8">
      <Headline>YOUR PROGRESS</Headline>

      {/* One number that only ever goes up: free-form actions + completed
          Missions, every deed counted once. The cards below always sum to it.
          The arc reads as a percentage — each proof is 1% of the circle,
          full at one hundred. */}
      <div className="mt-8 flex justify-center">
        <ProgressRing
          value={stats.totalDeeds}
          max={100}
          label="ACTION PROOFS"
          display="count"
        />
      </div>

      <p className="mt-6 text-center text-[15px] text-ink-1">
        Every completed action is proof that you&apos;re taking steps toward
        the man you know you&apos;re becoming.
      </p>

      {complete && (
        <GlassCard className="mt-6 border-[rgba(201,166,72,.35)]">
          <Eyebrow tone="gold">30-DAY MISSION COMPLETE</Eyebrow>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-1">
            You completed thirty actions and created thirty pieces of evidence.
            The Mission Log remains open. Keep using Honor, Courage, and
            Commitment whenever you need them.
          </p>
          <div className="mt-5">
            <Button onClick={() => router.push("/home")}>
              LOG A NEW ACTION
            </Button>
          </div>
        </GlassCard>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Stat label="Honor" value={stats.freeform.honor} />
        <Stat label="Courage" value={stats.freeform.courage} />
        <Stat label="Commitment" value={stats.freeform.commitment} />
        <Stat label="Actions In Progress" value={stats.actionsInProgress} />
        <div className="col-span-2">
          <Stat
            label="Missions Completed"
            value={`${stats.missionsCompleted}/${MISSION_COUNT}`}
          />
        </div>
      </div>

      <Button
        className="btn-shine mt-6 min-h-16 text-[17px]"
        onClick={() => router.push("/personal-code")}
      >
        VIEW MY PERSONAL CODE
      </Button>

      <BuyRow />
    </main>
  );
}
