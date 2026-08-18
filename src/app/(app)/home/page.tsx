"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DayBadge from "@/components/DayBadge";
import RepCounts from "@/components/RepCounts";
import TriggerCard from "@/components/TriggerCard";
import Wordmark from "@/components/Wordmark";
import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import GlassCard from "@/components/ui/GlassCard";
import Headline from "@/components/ui/Headline";
import { useToast } from "@/components/ui/Toast";
import { PRODUCT } from "@/content/product";
import { TRIGGERS, TRIGGER_ORDER } from "@/content/triggers";
import { challengeDay, getMode, getPhase } from "@/lib/challenge";
import { store, useAppData } from "@/lib/data/store";
import type { Mission } from "@/lib/data/types";
import { isDemo } from "@/lib/env";
import { computeStats } from "@/lib/stats";
import { readReminder, todayLocal } from "@/lib/utils";

const COMPLETION_SHOWN_KEY = "mission.completionShown";

function Skeleton() {
  return (
    <div className="mt-6 space-y-3" aria-hidden>
      {/* Same height as a loaded TriggerCard (104px body + 2 x 20px padding). */}
      {[0, 1, 2].map((index) => (
        <div key={index} className="glass h-[144px] rounded-[20px] opacity-50" />
      ))}
    </div>
  );
}

/**
 * Mounts only once the Missions are loaded, so the reminder check reads
 * localStorage after hydration and settles once per active Mission.
 */
function ActiveMissionBanner({ mission }: { mission: Mission }) {
  const router = useRouter();
  const [reminderDue] = useState(() => {
    const reminder = readReminder();
    return Boolean(
      reminder &&
        reminder.missionId === mission.id &&
        new Date(reminder.at).getTime() <= Date.now(),
    );
  });

  return (
    <GlassCard accent={mission.trigger} className="mt-6">
      <Eyebrow accent={mission.trigger} tone="gold">
        {reminderDue ? "REMINDER" : "MISSION ACTIVE"} ·{" "}
        {TRIGGERS[mission.trigger].name}
      </Eyebrow>
      <p className="font-display mt-3 text-[22px] leading-tight text-ink-0">
        {mission.action_text}
      </p>
      <div className="mt-5 space-y-2">
        <Button onClick={() => router.push(`/mission/checkin/${mission.id}`)}>
          CHECK IN NOW
        </Button>
        <Button
          variant="ghost"
          onClick={() => router.push(`/mission/active/${mission.id}`)}
        >
          Open Mission
        </Button>
      </div>
    </GlassCard>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { showToast } = useToast();

  const { profile, missions, error, refresh } = useAppData();

  useEffect(() => {
    if (!error) return;
    showToast("Couldn't load your Missions.", { retry: () => void refresh() });
  }, [error, refresh, showToast]);

  // Backfill a missing start date once, so Day 1 is anchored.
  useEffect(() => {
    if (isDemo() || !profile) return;
    if (!profile.onboarding_completed || profile.challenge_start_date) return;
    void store.updateProfile({ challenge_start_date: todayLocal() }).catch(
      () => {},
    );
  }, [profile]);

  const activeMission = missions?.find((m) => m.status === "active") ?? null;

  useEffect(() => {
    if (!profile) return;
    if (getMode(profile) !== "completion-pending") return;
    if (window.sessionStorage.getItem(COMPLETION_SHOWN_KEY) === "1") return;
    window.sessionStorage.setItem(COMPLETION_SHOWN_KEY, "1");
    router.push("/challenge-complete");
  }, [profile, router]);

  const mode = profile ? getMode(profile) : "challenge";
  const day = profile ? challengeDay(profile) : 1;
  const phase = getPhase(day);
  const stats = computeStats(missions ?? []);

  return (
    <main className="pt-4">
      <div className="flex items-center justify-between gap-3">
        <Wordmark />
        {profile && <DayBadge mode={mode} day={day} />}
      </div>

      {profile && mode !== "log" && (
        <div className="mt-6">
          <Eyebrow tone="gold">
            PHASE {phase.phase} · {phase.title}
          </Eyebrow>
          <p className="mt-2 text-[15px] text-ink-1">{phase.body}</p>
        </div>
      )}

      <Headline className="mt-6">WHAT DO YOU NEED TODAY?</Headline>

      {!missions ? (
        <Skeleton />
      ) : (
        <>
          {activeMission && (
            <ActiveMissionBanner
              key={activeMission.id}
              mission={activeMission}
            />
          )}

          <div className="mt-6 space-y-3">
            {TRIGGER_ORDER.map((trigger) => (
              <div key={trigger}>
                {mode !== "log" && phase.featuredTrigger === trigger && (
                  <Eyebrow tone="gold" className="mb-2">
                    FEATURED THIS PHASE
                  </Eyebrow>
                )}
                <TriggerCard
                  trigger={trigger}
                  href={`/mission/declare?trigger=${trigger}`}
                />
              </div>
            ))}
          </div>

          <div className="mt-8">
            <RepCounts reps={stats.reps} />
            {stats.completed > 0 && (
              <p className="mt-4 text-center text-[15px] text-ink-1">
                {stats.completed} Missions completed
              </p>
            )}
          </div>

          {!activeMission && (
            <Link href="/shop" className="mt-8 block">
              <GlassCard className="border-[rgba(201,166,72,.35)]">
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <Eyebrow tone="gold">{PRODUCT.homeCardEyebrow}</Eyebrow>
                    <p className="mt-2 text-[17px] text-ink-0">
                      {PRODUCT.homeCardText}
                    </p>
                  </div>
                  <ChevronRight aria-hidden className="text-ink-2" size={22} />
                </div>
              </GlassCard>
            </Link>
          )}
        </>
      )}
    </main>
  );
}
