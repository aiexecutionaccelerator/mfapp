"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MissionRow from "@/components/MissionRow";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Headline from "@/components/ui/Headline";
import Pill from "@/components/ui/Pill";
import Spinner from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { TRIGGER_ORDER } from "@/content/triggers";
import { useAppData } from "@/lib/data/store";
import { computeStats } from "@/lib/stats";
import type { Trigger } from "@/lib/data/types";

type Filter = "all" | Trigger;

const FILTERS: Filter[] = ["all", ...TRIGGER_ORDER];

export default function LogPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const { missions, error, refresh } = useAppData();
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    if (!error) return;
    showToast("Couldn't load your Mission Log.", {
      retry: () => void refresh(),
    });
  }, [error, refresh, showToast]);

  const visible =
    missions?.filter((m) => filter === "all" || m.trigger === filter) ?? [];
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

      {/* One scrollable row — the filters never wrap on narrow screens. */}
      <div className="-mx-5 mt-4 overflow-x-auto px-5">
        <div className="flex w-max gap-2">
          {FILTERS.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
              className="flex min-h-12 items-center"
            >
              <Pill active={filter === value}>{value.toUpperCase()}</Pill>
            </button>
          ))}
        </div>
      </div>

      {!missions ? (
        <div className="mt-10 flex justify-center text-ink-2">
          <Spinner />
        </div>
      ) : visible.length === 0 ? (
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
          {visible.map((mission) => (
            <MissionRow key={mission.id} mission={mission} />
          ))}
        </div>
      )}
    </main>
  );
}
