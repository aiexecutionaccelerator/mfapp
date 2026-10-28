"use client";

import { Check, History, Info } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Suspense, use, useEffect, useState } from "react";
import MissionTrack from "@/components/MissionTrack";
import NavAction from "@/components/NavAction";
import CompletionMedal from "@/components/motion/CompletionMedal";
import StarSystem from "@/components/StarSystem";
import { ContextPanels } from "@/components/mission/ContextPanels";
import MissionForm, { type FormMode } from "@/components/mission/MissionForm";
import Button from "@/components/ui/Button";
import Disclosure from "@/components/ui/Disclosure";
import Eyebrow from "@/components/ui/Eyebrow";
import GlassCard from "@/components/ui/GlassCard";
import Headline from "@/components/ui/Headline";
import Sheet from "@/components/ui/Sheet";
import Spinner from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { getMissionDef, stageOf, type MissionDef } from "@/content/missions";
import { getMissionDefV1 } from "@/content/missions-v1";
import { TRIGGERS } from "@/content/triggers";
import { track } from "@/lib/analytics";
import {
  KIND_LABELS,
  isLegacy,
  isLive,
  recordFor,
  recordText,
  successLine,
} from "@/lib/curriculum";
import { store, useAppData } from "@/lib/data/store";
import type { Mission } from "@/lib/data/types";
import {
  MISSION_COUNT,
  completedMissionNumbers,
  nextMissionNumber,
} from "@/lib/stats";
import { formatDate, formatDay } from "@/lib/utils";

/**
 * The one reusable Mission template: every Mission renders through here,
 * driven by `content/missions.ts` (curriculum revision 2), the rules in
 * `lib/curriculum.ts`, and his records.
 *
 * Order (spec): back, N of 30 and saved state · stage, title, hook and the
 * S.T.A.R. reminder · the S, T, A, R steps · the save.
 *
 * A saved record shows as itself (with SAVE CHANGES behind EDIT). A record
 * made under the first curriculum keeps its original wording and says so.
 */
function MissionDetailInner({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = use(params);
  const router = useRouter();
  const { showToast } = useToast();
  const { profile, missions, drafts, error, refresh } = useAppData();

  const missionNumber = Number(number);
  const def = Number.isInteger(missionNumber)
    ? getMissionDef(missionNumber)
    : undefined;

  const [mode, setMode] = useState<FormMode | null>(null);
  const [justSaved, setJustSaved] = useState<Mission | null>(null);
  const [starOpen, setStarOpen] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    if (!def) router.replace("/missions");
  }, [def, router]);

  useEffect(() => {
    if (def) track("mission_opened", { missionNumber: def.number });
  }, [def]);

  useEffect(() => {
    if (!error) return;
    showToast("Couldn't load this Mission.", { retry: () => void refresh() });
  }, [error, refresh, showToast]);

  if (!def || !profile || !missions || !drafts) {
    return (
      <main className="flex flex-1 items-center justify-center text-ink-2">
        <Spinner />
      </main>
    );
  }

  const record = recordFor(missions, def.number);
  const live = record && isLive(record) ? record : null;
  const removed = record?.status === "completed" && record.removed_at ? record : null;
  const draft = drafts.find((d) => d.mission_number === def.number) ?? null;
  const next = nextMissionNumber(missions);

  /* ---------- just saved ---------- */

  // Shown only for the Mission it belongs to. Continuing to the next Mission
  // just navigates: the success screen stays up until the next Mission
  // replaces it, instead of clearing first and flashing this Mission's saved
  // view in between.
  if (justSaved && justSaved.mission_number === def.number) {
    const done = completedMissionNumbers(missions);
    const allDone = done.size >= MISSION_COUNT;
    return (
      <main className="fade-in flex flex-1 flex-col pt-10">
        <CompletionMedal quiet={def.kind !== "action"} />
        <Headline className="mt-8 text-center">
          {allDone ? "30-DAY MISSION COMPLETE" : "MISSION COMPLETE."}
        </Headline>
        <p className="font-display gold-shimmer mt-4 text-center text-[26px] leading-snug">
          {successLine(def, justSaved)}
        </p>
        <p className="mt-5 text-center text-[17px] text-ink-1">
          {allDone
            ? "Keep going. Log what you practice next as One-Off Actions."
            : "It's in your Proof Log."}
        </p>
        <div className="mt-8 rise-in" style={{ animationDelay: "400ms" }}>
          <div className="flex items-baseline justify-between">
            <span className="eyebrow text-ink-2">YOUR 30</span>
            <span className="font-display text-[20px] text-ink-0">
              {done.size}
              <span className="text-ink-2">/{MISSION_COUNT}</span>
            </span>
          </div>
          <MissionTrack className="mt-2" completed={done} next={next} fresh={def.number} />
        </div>
        <div className="mt-10">
          {allDone ? (
            <Button onClick={() => router.push("/personal-code")}>
              VIEW MY PERSONAL CODE
            </Button>
          ) : (
            <Button
              onClick={() => router.push(next ? `/missions/${next}` : "/missions")}
            >
              {next ? `CONTINUE TO MISSION ${next}` : "BACK TO MISSIONS"}
            </Button>
          )}
        </div>
      </main>
    );
  }

  const status = live
    ? "COMPLETE"
    : removed
      ? "REMOVED"
      : draft
        ? "DRAFT SAVED"
        : "NOT STARTED";

  const intro = (
    <>
      <div className="flex items-center justify-between">
        <NavAction kind="back" href="/missions" />
        <span className="eyebrow text-ink-2">
          MISSION {def.number} OF {MISSION_COUNT}
        </span>
        <span
          className={
            live ? "eyebrow text-[var(--success)]" : draft ? "eyebrow text-gold-300" : "eyebrow text-ink-2"
          }
        >
          {status}
        </span>
      </div>

      <Eyebrow tone="gold" className="mt-6">
        {stageOf(def).label} · Mission {def.number}
      </Eyebrow>
      <Headline level={2} className="mt-2">
        {def.title}
      </Headline>
      <p className="mt-3 text-[19px] leading-snug text-ink-0">{def.hook}</p>

      <button
        type="button"
        onClick={() => {
          setStarOpen(true);
          track("star_reminder_opened", { missionNumber: def.number });
        }}
        className="mt-4 flex min-h-11 items-center gap-2 text-left text-[14px] text-gold-300"
      >
        <Info aria-hidden size={16} className="shrink-0" />
        Click here for a reminder of how the S.T.A.R. System works.
      </button>

      <Sheet open={starOpen} title="THE S.T.A.R. SYSTEM" onClose={() => setStarOpen(false)}>
        <StarSystem />
        <Button variant="secondary" onClick={() => setStarOpen(false)}>
          GOT IT
        </Button>
      </Sheet>
    </>
  );

  const form = (formMode: FormMode, against: Mission | null) => (
    <>
      <div className="mt-6 border-t border-[var(--line)]" />
      <p className="font-display mt-6 text-[20px] leading-snug text-ink-0">
        {def.number === 1
          ? "Let's get started with the S.T.A.R. System."
          : "Let's use the S.T.A.R. System."}
      </p>
      <MissionForm
        key={`${formMode}-${against?.updated_at ?? "new"}`}
        def={def}
        mode={formMode}
        record={against}
        draft={formMode === "edit" ? null : draft}
        missions={missions}
        profile={profile}
        onSaved={(saved) => {
          if (formMode === "edit") {
            setMode(null);
            showToast("Changes saved.");
          } else {
            setMode(null);
            setJustSaved(saved);
            window.scrollTo({ top: 0 });
          }
        }}
        onCancel={() => setMode(null)}
      />
    </>
  );

  /* ---------- a record that was removed ---------- */

  if (removed) {
    return (
      <main className="pt-2 pb-8">
        {intro}
        <GlassCard className="mt-6">
          <Eyebrow>REMOVED {removed.removed_at ? formatDate(removed.removed_at).toUpperCase() : ""}</Eyebrow>
          <p className="mt-3 text-[17px] leading-relaxed whitespace-pre-wrap text-ink-1">
            {recordText(removed)}
          </p>
          <p className="mt-3 text-[13px] text-ink-2">
            Removed records don&apos;t count. Restore it to bring it back with its
            original date.
          </p>
          <div className="mt-4">
            <Button
              variant="secondary"
              loading={restoring}
              onClick={async () => {
                setRestoring(true);
                try {
                  await store.setRemoved(removed.id, false);
                  showToast("Restored.");
                } catch {
                  showToast("Couldn't restore that. Please try again.");
                } finally {
                  setRestoring(false);
                }
              }}
            >
              RESTORE
            </Button>
          </div>
        </GlassCard>
      </main>
    );
  }

  /* ---------- a saved record ---------- */

  if (live && mode === null) {
    const legacy = isLegacy(live);
    const v1 = legacy ? getMissionDefV1(def.number) : undefined;
    return (
      <main className="pt-2 pb-8">
        {intro}

        {legacy && (
          <div className="mt-6 rounded-[14px] border border-[var(--line)] p-4">
            <p className="eyebrow flex items-center gap-2 text-ink-2">
              <History aria-hidden size={14} />
              SAVED UNDER EARLIER WORDING
            </p>
            <p className="mt-2 text-[14px] leading-snug text-ink-1">
              You completed this Mission when it was{" "}
              <span className="text-ink-0">“{v1?.title ?? "an earlier version"}”</span>
              {v1?.action ? `: ${v1.action}` : "."} Your record stays attached to
              that task, and it still counts.
            </p>
          </div>
        )}

        <RecordCard def={def} record={live} />

        {legacy && def.number === 21 && (
          <div className="mt-6">
            <p className="text-[15px] leading-snug text-ink-1">
              Missions 22–25 work on a seven-day aim. Your earlier record
              didn&apos;t have one. Add a current aim; your earlier record is kept.
            </p>
            <div className="mt-3">
              <Button onClick={() => setMode("revise")}>ADD A CURRENT AIM</Button>
            </div>
          </div>
        )}

        {legacy && def.number !== 21 && <RevisedTaskPreview def={def} />}

        <div className="mt-6 space-y-2">
          <Button variant="secondary" onClick={() => setMode("edit")}>
            EDIT
          </Button>
          {next && next !== def.number && (
            <Button onClick={() => router.push(`/missions/${next}`)}>
              CONTINUE TO MISSION {next}
            </Button>
          )}
        </div>
      </main>
    );
  }

  /* ---------- unfinished, or editing ---------- */

  return (
    <main className="pt-2 pb-8">
      {intro}
      {live && mode === "edit" && (
        <p className="mt-4 text-[14px] text-ink-2">
          Editing your saved record. Its original date stays.
        </p>
      )}
      {form(mode ?? "new", live)}
    </main>
  );
}

/** The saved record: kind, value, date, his words, and what it worked toward. */
function RecordCard({ def, record }: { def: MissionDef; record: Mission }) {
  const legacy = isLegacy(record);
  return (
    <GlassCard key={record.id} className="mt-6 border-[rgba(201,166,72,.35)]">
      <div className="flex items-center gap-2">
        <Check aria-hidden size={18} className="text-gold-300" />
        <Eyebrow tone="gold">
          {KIND_LABELS[record.kind ?? def.kind]} · {TRIGGERS[record.trigger].name}
          {record.completed_at ? ` · ${formatDate(record.completed_at)}` : ""}
        </Eyebrow>
      </div>
      {record.focus_area && (
        <p className="eyebrow mt-3 text-ink-2">{record.focus_area.toUpperCase()}</p>
      )}
      <p className="mt-3 text-[19px] leading-relaxed whitespace-pre-wrap text-ink-0">
        {recordText(record)}
      </p>
      {(record.frequency || record.review_date) && (
        <p className="mt-3 text-[14px] text-ink-1">
          {[record.frequency, record.review_date && `Review ${formatDay(record.review_date)}`]
            .filter(Boolean)
            .join(" · ")}
        </p>
      )}
      {record.photo_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={record.photo_url} alt="Your photo" className="mt-4 w-full rounded-[14px]" />
      )}
      {record.updated_at &&
        record.completed_at &&
        new Date(record.updated_at).getTime() - new Date(record.completed_at).getTime() > 60_000 && (
          <p className="mt-3 text-[13px] text-ink-2">Edited {formatDate(record.updated_at)}</p>
        )}
      {!legacy && record.context && Object.values(record.context).some(Boolean) && (
        <div className="mt-2">
          <p className="eyebrow mt-4 text-ink-2">WHAT IT WORKED WITH</p>
          <ContextPanels context={record.context} missionNumber={def.number} />
        </div>
      )}
      {record.history?.map((old) => (
        <div key={old.completed_at ?? old.text} className="mt-4 border-t border-[var(--line)] pt-3">
          <p className="eyebrow text-ink-2">
            EARLIER RECORD{old.completed_at ? ` · ${formatDate(old.completed_at)}` : ""}
          </p>
          <p className="mt-1 text-[15px] whitespace-pre-wrap text-ink-1">{old.text}</p>
        </div>
      ))}
    </GlassCard>
  );
}

/** A first-curriculum record can show the revised task, separately. */
function RevisedTaskPreview({ def }: { def: MissionDef }) {
  return (
    <Disclosure className="mt-6" label="See the revised task">
      <p className="text-[15px] leading-snug text-ink-0">{def.action}</p>
      <p className="eyebrow mt-3 text-gold-300">DONE WHEN</p>
      <p className="mt-1 text-[14px] leading-snug text-ink-1">{def.doneWhen}</p>
      <p className="mt-3 text-[13px] text-ink-2">
        You don&apos;t need to redo it. Your earlier record still counts.
      </p>
    </Disclosure>
  );
}

export default function MissionDetailPage(props: {
  params: Promise<{ number: string }>;
}) {
  // Keyed by Mission: moving to another Mission starts it fresh (no stale
  // success screen or half-typed form carried over), and the swap happens
  // only once the next Mission is ready to show.
  const { number } = useParams<{ number: string }>();
  return (
    <Suspense fallback={null}>
      <MissionDetailInner key={number} {...props} />
    </Suspense>
  );
}
