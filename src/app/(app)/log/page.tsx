"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import MissionRow from "@/components/MissionRow";
import Button from "@/components/ui/Button";
import Disclosure from "@/components/ui/Disclosure";
import EmptyState from "@/components/ui/EmptyState";
import Headline from "@/components/ui/Headline";
import Spinner from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { useAppData } from "@/lib/data/store";
import { computeStats } from "@/lib/stats";

export default function LogPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const { missions, error, refresh } = useAppData();

  useEffect(() => {
    if (!error) return;
    showToast("Couldn't load your Proof Log.", {
      retry: () => void refresh(),
    });
  }, [error, refresh, showToast]);

  const stats = computeStats(missions ?? []);
  const shown = (missions ?? []).filter((m) => !m.removed_at);
  const removed = (missions ?? []).filter((m) => m.removed_at);

  return (
    <main className="pt-4">
      <Headline>PROOF LOG</Headline>

      <p className="mt-4 text-[15px] leading-relaxed text-ink-1">
        Every Mission and One-Off Action you complete lands here. Actions are
        your evidence. Reflections, code and plans are marked as what they are.
      </p>
      {missions && (
        <p className="mt-2 text-[13px] text-ink-2">
          {stats.totalRecords} {stats.totalRecords === 1 ? "record" : "records"}{" "}
          · {stats.totalActions} {stats.totalActions === 1 ? "action" : "actions"}
        </p>
      )}

      {!missions ? (
        <div className="mt-10 flex justify-center text-ink-2">
          <Spinner />
        </div>
      ) : shown.length === 0 && removed.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="Nothing logged yet."
            body="Start with Mission 1. It takes a minute."
            action={
              <Button onClick={() => router.push("/missions/1")}>
                START MISSION 1
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <div className="mt-6 space-y-3">
            {shown.map((mission) => (
              <MissionRow key={mission.id} mission={mission} />
            ))}
          </div>
          {removed.length > 0 && (
            <Disclosure
              className="mt-6"
              label={`Removed (${removed.length})`}
              helper="Removed records don't count. Open one to restore it."
            >
              <div className="space-y-3">
                {removed.map((mission) => (
                  <MissionRow key={mission.id} mission={mission} />
                ))}
              </div>
            </Disclosure>
          )}
        </>
      )}

    </main>
  );
}
