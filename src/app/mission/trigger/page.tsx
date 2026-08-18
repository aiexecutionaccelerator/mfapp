"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import BottleVisual from "@/components/BottleVisual";
import NavAction from "@/components/NavAction";
import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import { useToast } from "@/components/ui/Toast";
import { pickBriefing } from "@/content/missionBriefings";
import { TRIGGERS, TRIGGER_ACCENTS } from "@/content/triggers";
import { data } from "@/lib/data";
import type { MissionDraft } from "@/lib/data/types";
import { clearDraft, readDraft } from "@/lib/utils";

export default function TriggerPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [draft, setDraft] = useState<MissionDraft | null>(null);
  const [briefing, setBriefing] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const starting = useRef(false);

  useEffect(() => {
    const current = readDraft();
    if (!current) {
      router.replace("/home");
      return;
    }
    data
      .listMissions()
      .then((missions) => {
        const count = missions.filter(
          (mission) => mission.trigger === current.trigger,
        ).length;
        setDraft(current);
        setBriefing(pickBriefing(current.trigger, count).text);
      })
      .catch(() => {
        setDraft(current);
        setBriefing(pickBriefing(current.trigger, 0).text);
      });
  }, [router]);

  if (!draft) return null;

  const meta = TRIGGERS[draft.trigger];
  const tone = TRIGGER_ACCENTS[draft.trigger];

  async function start() {
    if (starting.current || !draft) return;
    starting.current = true;
    setPending(true);
    try {
      const mission = await data.createMission({
        trigger: draft.trigger,
        action_text: draft.action_text,
        action_category: draft.action_category,
      });
      clearDraft();
      router.replace(`/mission/active/${mission.id}`);
    } catch {
      starting.current = false;
      setPending(false);
      showToast(
        "Couldn't start your Mission. Check your connection and try again.",
        { retry: () => void start() },
      );
    }
  }

  return (
    <main className="relative flex min-h-dvh flex-col pt-[calc(env(safe-area-inset-top)+8px)]">
      <NavAction
        kind="back"
        href={`/mission/declare?trigger=${draft.trigger}`}
      />

      <div className="relative mt-6 flex flex-col items-center overflow-hidden py-6">
        <span
          aria-hidden
          className="ghost-word top-2 left-1/2 -translate-x-1/2 text-[72px]"
        >
          {meta.name}
        </span>
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{ background: tone.glow }}
        />
        <BottleVisual trigger={draft.trigger} size={120} className="relative" />
      </div>

      <Eyebrow accent={draft.trigger} className="mt-6">
        {meta.name}
      </Eyebrow>
      <p className="font-display mt-3 text-[30px] leading-tight text-ink-0">
        {draft.action_text}
      </p>

      {briefing && <p className="mt-6 text-[17px] text-ink-0">{briefing}</p>}

      <p className="eyebrow mt-8 text-[15px] text-gold-300 uppercase">
        {meta.applyLine}
      </p>

      <div className="mt-auto pt-10 pb-10">
        <Button loading={pending} onClick={start}>
          START MISSION
        </Button>
      </div>
    </main>
  );
}
