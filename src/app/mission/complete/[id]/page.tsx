"use client";

import { useRouter } from "next/navigation";
import { use, useEffect } from "react";
import BottomActions from "@/components/ui/BottomActions";
import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import Headline from "@/components/ui/Headline";
import { pickCompletionLine } from "@/content/completionLines";
import { TRIGGERS } from "@/content/triggers";
import { ART, artUrl } from "@/lib/art";
import { useAppData } from "@/lib/data/store";
import { computeStats, repNumberFor } from "@/lib/stats";

function GoldCoin() {
  const crest = artUrl(ART.crest);
  return (
    <div className="relative h-24 w-24" aria-hidden>
      <svg width="96" height="96" viewBox="0 0 96 96" fill="none" className="absolute inset-0">
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
        {!crest && (
          <path
            d="M32 49.5 43 60l21-24"
            stroke="url(#coin-gold)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
      {crest && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={crest}
          alt=""
          className="absolute inset-0 m-auto h-12 w-12 object-contain"
        />
      )}
    </div>
  );
}

export default function CompletePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const { missions, error } = useAppData();
  const found = missions?.find((item) => item.id === id) ?? null;
  const mission = found?.status === "completed" ? found : null;

  useEffect(() => {
    if (error || (missions && !mission)) router.replace("/home");
  }, [error, missions, mission, router]);

  if (!mission || !missions) return null;

  const repNumber = repNumberFor(missions, mission);
  const totalCompleted = computeStats(missions).completed;

  return (
    <main className="fade-in flex flex-1 flex-col pt-10">
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

      <BottomActions className="pt-10">
        <Button onClick={() => router.push("/home")}>DONE</Button>
        <Button variant="secondary" onClick={() => router.push("/log")}>
          VIEW MY LOG
        </Button>
      </BottomActions>
    </main>
  );
}
