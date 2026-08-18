"use client";

import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import NavAction from "@/components/NavAction";
import BottomActions from "@/components/ui/BottomActions";
import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import Headline from "@/components/ui/Headline";
import Sheet from "@/components/ui/Sheet";
import { useToast } from "@/components/ui/Toast";
import { TRIGGERS } from "@/content/triggers";
import { data } from "@/lib/data";
import type { Mission } from "@/lib/data/types";
import { relativeTime, writeReminder } from "@/lib/utils";

const OPTIONS: { label: string; minutes: number | "tonight" }[] = [
  { label: "30 minutes", minutes: 30 },
  { label: "1 hour", minutes: 60 },
  { label: "3 hours", minutes: 180 },
  { label: "Tonight (8 PM)", minutes: "tonight" },
];

function reminderTime(option: number | "tonight"): Date {
  if (option !== "tonight") return new Date(Date.now() + option * 60_000);
  const tonight = new Date();
  tonight.setHours(20, 0, 0, 0);
  if (tonight.getTime() <= Date.now()) tonight.setDate(tonight.getDate() + 1);
  return tonight;
}

export default function ActiveMissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { showToast } = useToast();

  const [mission, setMission] = useState<Mission | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    data
      .getMission(id)
      .then((found) => {
        if (!found || found.status === "ended") {
          router.replace("/home");
          return;
        }
        if (found.status === "completed") {
          router.replace(`/mission/complete/${found.id}`);
          return;
        }
        setMission(found);
      })
      .catch(() => router.replace("/home"));
  }, [id, router]);

  if (!mission) return null;

  function chooseReminder(option: number | "tonight") {
    if (!mission) return;
    writeReminder({
      missionId: mission.id,
      at: reminderTime(option).toISOString(),
    });
    setSheetOpen(false);
    showToast("We'll flag this Mission when you're back.");
  }

  return (
    <main className="flex flex-1 flex-col pt-2">
      <div className="flex justify-end">
        <NavAction kind="close" href="/home" />
      </div>

      <div className="mt-10">
        <Eyebrow accent={mission.trigger}>
          {TRIGGERS[mission.trigger].name}
        </Eyebrow>
        <Headline className="mt-3">MISSION ACTIVE</Headline>
        <p className="font-display mt-6 text-[28px] leading-tight text-ink-0">
          {mission.action_text}
        </p>
        <p className="mt-6 text-[17px] text-ink-1">Phone down. Go do it.</p>
        <p className="mt-2 text-[13px] text-ink-2">
          Started {relativeTime(mission.started_at)}
        </p>
      </div>

      <BottomActions className="pt-10">
        <Button onClick={() => router.push(`/mission/checkin/${mission.id}`)}>
          CHECK IN NOW
        </Button>
        <Button variant="secondary" onClick={() => setSheetOpen(true)}>
          REMIND ME LATER
        </Button>
      </BottomActions>

      <Sheet
        open={sheetOpen}
        title="REMIND ME LATER"
        note="Reminders show inside the app in this version."
        onClose={() => setSheetOpen(false)}
      >
        {OPTIONS.map((option) => (
          <Button
            key={option.label}
            variant="secondary"
            onClick={() => chooseReminder(option.minutes)}
          >
            {option.label}
          </Button>
        ))}
      </Sheet>
    </main>
  );
}
