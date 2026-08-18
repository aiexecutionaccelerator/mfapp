"use client";

import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import Headline from "@/components/ui/Headline";
import { pickCompletionLine } from "@/content/completionLines";
import { TRIGGERS } from "@/content/triggers";
import { data } from "@/lib/data";
import type { Mission } from "@/lib/data/types";
import { computeStats, repNumberFor } from "@/lib/stats";

function GoldCoin() {
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" fill="none" aria-hidden>
      <defs>
        <linearGradient id="coin-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8F6E1E" />
          <stop offset="45%" stopColor="#D4AF37" />
          <stop offset="70%" stopColor="#E8D28A" />
          <stop offset="100%" stopColor="#B8912F" />
        </linearGradient>
      </defs>
      <circle
        cx="48"
        cy="48"
        r="42"
        stroke="url(#coin-gold)"
        strokeWidth="3"
        fill="rgba(212,175,55,.06)"
      />
      <path
        d="M32 49.5 43 60l21-24"
        stroke="url(#coin-gold)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function CompletePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [mission, setMission] = useState<Mission | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);

  useEffect(() => {
    data
      .listMissions()
      .then((all) => {
        const found = all.find((item) => item.id === id) ?? null;
        if (!found || found.status !== "completed") {
          router.replace("/home");
          return;
        }
        setMissions(all);
        setMission(found);
      })
      .catch(() => router.replace("/home"));
  }, [id, router]);

  if (!mission) return null;

  const repNumber = repNumberFor(missions, mission);
  const totalCompleted = computeStats(missions).completed;

  return (
    <main className="fade-in flex min-h-dvh flex-col pt-[calc(env(safe-area-inset-top)+40px)]">
      <div className="flex justify-center">
        <GoldCoin />
      </div>

      <Headline className="mt-8 text-center">
        {TRIGGERS[mission.trigger].name} REP #{repNumber} COMPLETE
      </Headline>

      <div className="glass mt-8 rounded-[20px] p-5">
        <Eyebrow>YOU SAID YOU WOULD:</Eyebrow>
        <p className="font-display mt-3 text-[26px] leading-tight text-ink-0">
          {mission.action_text}
        </p>
        <p className="font-display mt-4 text-[26px] leading-tight text-gold-gradient">
          AND YOU DID.
        </p>
      </div>

      <p className="mt-6 text-[17px] text-ink-1">
        {pickCompletionLine(totalCompleted)}
      </p>

      <div className="mt-auto space-y-3 pt-10 pb-10">
        <Button onClick={() => router.push("/home")}>DONE</Button>
        <Button variant="secondary" onClick={() => router.push("/progress")}>
          VIEW MY PROGRESS
        </Button>
      </div>
    </main>
  );
}
