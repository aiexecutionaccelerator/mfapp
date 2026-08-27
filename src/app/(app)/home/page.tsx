"use client";

import { BookOpen, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import BuyRow from "@/components/BuyRow";
import ProofCounts from "@/components/ProofCounts";
import TriggerCard from "@/components/TriggerCard";
import Wordmark from "@/components/Wordmark";
import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import GlassCard from "@/components/ui/GlassCard";
import Headline from "@/components/ui/Headline";
import { useToast } from "@/components/ui/Toast";
import { getMissionDef } from "@/content/missions";
import { TRIGGERS, TRIGGER_ORDER } from "@/content/triggers";
import { track } from "@/lib/analytics";
import { store, useAppData } from "@/lib/data/store";
import type { Mission, Profile } from "@/lib/data/types";
import {
  MISSION_COUNT,
  computeStats,
  nextMissionNumber,
} from "@/lib/stats";

/**
 * The permanent daily action launcher. The top card is the app's live status:
 * A set on the way · B next Mission · C action in progress · D 30/30 done.
 */
function StatusCard({
  profile,
  missions,
}: {
  profile: Profile;
  missions: Mission[];
}) {
  const router = useRouter();
  const { showToast } = useToast();

  const actives = missions.filter((m) => m.status === "active");

  // State C — actions in progress (structured and free-form alike). One card
  // each; with several, the row swipes and the next card peeks in from the
  // edge so it's discoverable.
  if (actives.length > 0) {
    const single = actives.length === 1;
    const cards = actives.map((active) => {
      const doneHref =
        active.mission_number !== null
          ? `/missions/${active.mission_number}?done=1`
          : `/mission/checkin/${active.id}`;
      return (
        <div
          key={active.id}
          className={single ? "w-full" : "w-[85%] shrink-0 snap-start"}
        >
          <GlassCard accent={active.trigger} className="h-full">
            <p className="eyebrow flex items-center gap-2 text-gold-300">
              <span
                aria-hidden
                className="live-dot inline-block h-2 w-2 shrink-0 rounded-full bg-[#e5484d]"
              />
              <span>
                {active.mission_number !== null
                  ? `MISSION ${active.mission_number} IN PROGRESS`
                  : "ACTION IN PROGRESS"}{" "}
                · {TRIGGERS[active.trigger].name}
              </span>
            </p>
            <p className="font-display mt-3 text-[22px] leading-tight text-ink-0">
              {active.action_text}
            </p>
            <div className="mt-5 space-y-2">
              <Button onClick={() => router.push(doneHref)}>I DID IT</Button>
              {active.mission_number === null && (
                <Button
                  variant="ghost"
                  onClick={() => router.push(`/mission/active/${active.id}`)}
                >
                  Open Mission
                </Button>
              )}
            </div>
          </GlassCard>
        </div>
      );
    });

    if (single) return <div className="mt-6">{cards}</div>;
    return (
      <div className="-mx-5 mt-6 snap-x snap-mandatory overflow-x-auto px-5">
        <div className="flex gap-3 pr-5">{cards}</div>
      </div>
    );
  }

  // State A — the set is still on the way.
  if (profile.set_status === "ordered") {
    return (
      <GlassCard className="mt-6 border-[rgba(201,166,72,.35)]">
        <Eyebrow tone="gold">YOUR SET IS ON THE WAY</Eyebrow>
        <p className="font-display mt-3 text-[22px] leading-tight text-ink-0">
          Explore Your 30-Day Mission
        </p>
        <div className="mt-5 space-y-2">
          <Button onClick={() => router.push("/missions")}>
            VIEW THE MISSIONS
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              void store
                .updateProfile({ set_status: "arrived" })
                .then(() => track("set_marked_arrived"))
                .catch(() => showToast("Couldn't save that. Please try again."));
            }}
          >
            MY SET HAS ARRIVED
          </Button>
        </div>
      </GlassCard>
    );
  }

  const next = nextMissionNumber(missions);

  // State D — all thirty Missions are complete.
  if (next === null) {
    return (
      <GlassCard className="mt-6 border-[rgba(201,166,72,.35)]">
        <Eyebrow tone="gold">30-DAY MISSION COMPLETE</Eyebrow>
        <p className="font-display mt-3 text-[22px] leading-tight text-ink-0">
          Keep Building the Evidence
        </p>
        <div className="mt-5">
          <Button onClick={() => router.push("/missions")}>
            START A NEW ACTION
          </Button>
        </div>
      </GlassCard>
    );
  }

  // State B — the next structured Mission.
  const def = getMissionDef(next);
  if (!def) return null;
  return (
    <Link href={`/missions/${def.number}`} className="mt-6 block">
      <GlassCard className="border-[rgba(201,166,72,.35)]">
        <Eyebrow tone="gold">NEXT MISSION · MISSION {def.number}</Eyebrow>
        <p className="font-display mt-3 text-[22px] leading-tight text-ink-0">
          {def.title}
        </p>
        <div className="mt-5">
          <Button>OPEN MISSION</Button>
        </div>
      </GlassCard>
    </Link>
  );
}

/**
 * How It Works, one tap from Start. Prominent below the status card until the
 * man has been through it once, then greyed out and moved to the bottom —
 * always still openable.
 */
function GuideCard({ done }: { done: boolean }) {
  return (
    <Link href="/how-it-works" className={done ? "mt-6 block" : "mt-4 block"}>
      <div
        className={
          done
            ? "glass flex items-center gap-3 rounded-[14px] px-4 py-3 opacity-60"
            : "glass flex items-center gap-3 rounded-[14px] border-[rgba(201,166,72,.35)] px-4 py-4"
        }
      >
        <BookOpen
          aria-hidden
          size={done ? 18 : 22}
          className={done ? "shrink-0 text-ink-2" : "shrink-0 text-gold-300"}
        />
        <span className="min-w-0 flex-1">
          <span
            className={
              done
                ? "block text-[13px] text-ink-2"
                : "eyebrow block text-gold-300"
            }
          >
            {done ? "HOW IT WORKS · Review any time" : "START HERE"}
          </span>
          {!done && (
            <span className="mt-1.5 block text-[17px] leading-snug text-ink-0">
              How Mission Fragrances works
            </span>
          )}
        </span>
        <ChevronRight aria-hidden size={done ? 18 : 20} className="shrink-0 text-ink-2" />
      </div>
    </Link>
  );
}

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

export default function HomePage() {
  const { showToast } = useToast();
  const { profile, missions, lessonResponses, error, refresh } = useAppData();

  useEffect(() => {
    if (!error) return;
    showToast("Couldn't load your Missions.", { retry: () => void refresh() });
  }, [error, refresh, showToast]);

  const stats = computeStats(missions ?? []);
  const guideDone =
    lessonResponses?.some(
      (r) => r.lesson_id === "guide" && r.prompt_id === "q" && r.answer === "done",
    ) ?? false;

  return (
    <main className="pt-4">
      <div className="flex items-center justify-between gap-3">
        <Wordmark />
        {missions && stats.missionsCompleted > 0 && (
          <span className="glass eyebrow rounded-full px-3 py-2 text-gold-300">
            {stats.missionsCompleted}/{MISSION_COUNT} MISSIONS
          </span>
        )}
      </div>

      {profile && missions && (
        <StatusCard profile={profile} missions={missions} />
      )}

      {missions && lessonResponses && !guideDone && <GuideCard done={false} />}

      <Headline className="mt-6">WHAT DO YOU NEED TODAY?</Headline>

      {!missions ? (
        <Skeleton />
      ) : (
        <>
          <div className="mt-6 space-y-3">
            {TRIGGER_ORDER.map((trigger) => (
              <TriggerCard
                key={trigger}
                trigger={trigger}
                href={`/mission/declare?trigger=${trigger}`}
              />
            ))}
          </div>

          <div className="mt-8">
            <ProofCounts stats={stats} />
          </div>

          {guideDone && <GuideCard done />}

          <BuyRow />
        </>
      )}
    </main>
  );
}
