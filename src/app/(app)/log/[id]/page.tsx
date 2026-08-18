"use client";

import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import NavAction from "@/components/NavAction";
import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import Headline from "@/components/ui/Headline";
import Spinner from "@/components/ui/Spinner";
import { TRIGGERS } from "@/content/triggers";
import { data } from "@/lib/data";
import type { Mission } from "@/lib/data/types";
import { formatDateTime } from "@/lib/utils";

const STATUS_LABEL = {
  completed: "COMPLETED",
  active: "ACTIVE",
  ended: "ENDED",
} as const;

export default function LogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [mission, setMission] = useState<Mission | null>(null);

  useEffect(() => {
    data
      .getMission(id)
      .then((found) => {
        if (!found) {
          router.replace("/log");
          return;
        }
        setMission(found);
      })
      .catch(() => router.replace("/log"));
  }, [id, router]);

  if (!mission) {
    return (
      <main className="flex min-h-dvh items-center justify-center text-ink-2">
        <Spinner />
      </main>
    );
  }

  return (
    <main className="pt-[calc(env(safe-area-inset-top)+8px)]">
      <NavAction kind="back" href="/log" />

      <div className="mt-6">
        <Eyebrow accent={mission.trigger}>
          {TRIGGERS[mission.trigger].name}
        </Eyebrow>
        <Headline level={2} className="mt-3">
          {mission.action_text}
        </Headline>
      </div>

      <dl className="glass mt-6 space-y-3 rounded-[20px] p-5 text-[15px]">
        <div className="flex justify-between gap-4">
          <dt className="text-ink-2">Status</dt>
          <dd className="text-ink-0">{STATUS_LABEL[mission.status]}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ink-2">Started</dt>
          <dd className="text-ink-0">{formatDateTime(mission.started_at)}</dd>
        </div>
        {mission.completed_at && (
          <div className="flex justify-between gap-4">
            <dt className="text-ink-2">Completed</dt>
            <dd className="text-ink-0">
              {formatDateTime(mission.completed_at)}
            </dd>
          </div>
        )}
        {mission.ended_at && (
          <div className="flex justify-between gap-4">
            <dt className="text-ink-2">Ended</dt>
            <dd className="text-ink-0">{formatDateTime(mission.ended_at)}</dd>
          </div>
        )}
      </dl>

      {mission.reflection && (
        <div className="glass mt-4 rounded-[20px] p-5">
          <Eyebrow>REFLECTION</Eyebrow>
          <p className="mt-3 text-[17px] text-ink-0">{mission.reflection}</p>
        </div>
      )}

      {mission.status === "active" && (
        <div className="mt-6">
          <Button
            onClick={() => router.push(`/mission/active/${mission.id}`)}
          >
            OPEN MISSION
          </Button>
        </div>
      )}
    </main>
  );
}
