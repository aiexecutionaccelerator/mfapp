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

  return (
    <main className="pt-4">
      <Headline>MISSION LOG</Headline>

      <div className="mt-5 flex flex-wrap gap-2">
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

      {!missions ? (
        <div className="mt-10 flex justify-center text-ink-2">
          <Spinner />
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No Missions yet."
            body="Start with one action today."
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
