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
import CountUp from "@/components/motion/CountUp";
import { useAppData } from "@/lib/data/store";
import { MISSION_COUNT, computeStats } from "@/lib/stats";

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="glass edge-lit rounded-[14px] p-4">
      <p className="font-display text-[40px] leading-none text-ink-0">
        {typeof value === "number" ? <CountUp value={value} /> : value}
      </p>
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

      {/* Actions only: things he did, from Missions and One-Off Actions.
          Reflections, code and plans are saved work, not evidence of a deed,
          so they count toward x/30 but never here (curriculum revision 2).
          The three cards below always sum to this number. Each action is 1%
          of the circle, full at one hundred. */}
      <div className="mt-8 flex justify-center">
        <ProgressRing
          value={stats.totalActions}
          max={100}
          label="ACTIONS LOGGED"
          display="count"
        />
      </div>

      <p className="mt-6 text-center text-[15px] text-ink-1">
        Proof you did it, not that you meant to.
      </p>

      {complete && (
        <GlassCard className="mt-6 border-[rgba(201,166,72,.35)]">
          <Eyebrow tone="gold">30-DAY MISSION COMPLETE</Eyebrow>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-1">
            Keep going. Log each repetition of your practice as a One-Off
            Action.
          </p>
          <div className="mt-5">
            <Button onClick={() => router.push("/action/declare")}>
              LOG A ONE-OFF ACTION
            </Button>
          </div>
        </GlassCard>
      )}

      {/* Actions by the Scent Trigger he used. Honor + Courage + Commitment
          always equals the number in the ring. */}
      <div className="stagger mt-6 grid grid-cols-2 gap-3">
        <Stat label="Honor" value={stats.actions.honor} />
        <Stat label="Courage" value={stats.actions.courage} />
        <Stat label="Commitment" value={stats.actions.commitment} />
        <Stat
          label="Missions Completed"
          value={`${stats.missionsCompleted}/${MISSION_COUNT}`}
        />
      </div>

      <Button
        className="btn-shine mt-6 min-h-16 text-[17px]"
        onClick={() => router.push("/personal-code")}
      >
        VIEW MY PERSONAL CODE
      </Button>
    </main>
  );
}
