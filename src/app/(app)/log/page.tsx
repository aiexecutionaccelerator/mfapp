"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import BuyRow from "@/components/BuyRow";
import MissionRow from "@/components/MissionRow";
import Button from "@/components/ui/Button";
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
    showToast("Couldn't load your Mission Log.", {
      retry: () => void refresh(),
    });
  }, [error, refresh, showToast]);

  const stats = computeStats(missions ?? []);

  return (
    <main className="pt-4">
      <Headline>MISSION LOG</Headline>

      <p className="mt-4 text-[15px] leading-relaxed text-ink-1">
        Every action you log is evidence of the man you are becoming.
      </p>
      {missions && (
        <p className="mt-2 text-[13px] text-ink-2">
          {stats.totalProofs} {stats.totalProofs === 1 ? "proof" : "proofs"}{" "}
          logged
        </p>
      )}

      {!missions ? (
        <div className="mt-10 flex justify-center text-ink-2">
          <Spinner />
        </div>
      ) : missions.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No proof yet."
            body="Take one small action today."
            action={
              <Button onClick={() => router.push("/home")}>
                START A MISSION
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {missions.map((mission) => (
            <MissionRow key={mission.id} mission={mission} />
          ))}
        </div>
      )}

      {missions && <BuyRow />}
    </main>
  );
}
