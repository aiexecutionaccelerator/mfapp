"use client";

import { Check, PenLine } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, use, useEffect, useRef, useState } from "react";
import NavAction from "@/components/NavAction";
import MissionVideo from "@/components/MissionVideo";
import PhotoInput from "@/components/PhotoInput";
import QuestionField from "@/components/QuestionField";
import Button from "@/components/ui/Button";
import Eyebrow, { AccentDot } from "@/components/ui/Eyebrow";
import Field from "@/components/ui/Field";
import GlassCard from "@/components/ui/GlassCard";
import Headline from "@/components/ui/Headline";
import Sheet from "@/components/ui/Sheet";
import Spinner from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { actionsFor, getMissionDef } from "@/content/missions";
import { TRIGGERS, TRIGGER_ORDER } from "@/content/triggers";
import { track } from "@/lib/analytics";
import { store, useAppData } from "@/lib/data/store";
import { compilePersonalCode } from "@/lib/personalCode";
import type { Trigger } from "@/lib/data/types";
import { PROOF_TEXT_MAX } from "@/lib/data/types";
import {
  MISSION_COUNT,
  computeStats,
  nextMissionNumber,
  structuredMissionRow,
} from "@/lib/stats";
import { cn, formatDate } from "@/lib/utils";

type SuggestionKind = "quick" | "standard" | "bold" | "custom";

const SUGGESTION_LABEL: Record<Exclude<SuggestionKind, "custom">, string> = {
  quick: "QUICK",
  standard: "STANDARD",
  bold: "BOLD",
};

/**
 * The one reusable Mission Detail template — every structured Mission renders
 * through here, driven by `content/missions.ts` plus the user's state row.
 * Reading never completes anything: only LOG THE PROOF does.
 */
function MissionDetailInner({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = use(params);
  const router = useRouter();
  const search = useSearchParams();
  const { showToast } = useToast();
  const { profile, missions, lessonResponses, error, refresh } = useAppData();

  const missionNumber = Number(number);
  const def = Number.isInteger(missionNumber)
    ? getMissionDef(missionNumber)
    : undefined;

  const [selected, setSelected] = useState<SuggestionKind | null>(null);
  const [customText, setCustomText] = useState("");
  const [chosenTrigger, setChosenTrigger] = useState<Trigger | null>(null);
  const [starOpen, setStarOpen] = useState(false);
  const [confirmAbandon, setConfirmAbandon] = useState(false);
  // "auto" follows the row's status; the rest are explicit user steps.
  // ?done=1 (the Start card's I DID IT) opens the completion form directly.
  const [view, setView] = useState<"auto" | "proof-form" | "confirmation">(
    search.get("done") === "1" ? "proof-form" : "auto",
  );
  const [proofText, setProofText] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [editingAction, setEditingAction] = useState(false);
  const [editText, setEditText] = useState("");
  const [pending, setPending] = useState(false);
  const submitting = useRef(false);
  // For the timeSinceMissionOpened analytics property (spec §12).
  const openedAt = useRef(Date.now());

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

  if (!def || !profile || !missions || !lessonResponses) {
    return (
      <main className="flex flex-1 items-center justify-center text-ink-2">
        <Spinner />
      </main>
    );
  }

  const row = structuredMissionRow(missions, def.number);
  const status: "not_started" | "in_progress" | "completed" =
    row === null
      ? "not_started"
      : row.status === "completed"
        ? "completed"
        : "in_progress";

  const trigger: Trigger =
    chosenTrigger ?? row?.trigger ?? def.recommendedTrigger ?? "honor";
  // "User chooses" Missions need an explicit choice before declaring.
  const triggerChosen =
    chosenTrigger !== null || row !== null || def.recommendedTrigger !== null;

  const actions = actionsFor(def, trigger);
  const savedAnswer =
    lessonResponses.find(
      (r) => r.lesson_id === def.slug && r.prompt_id === "q",
    )?.answer ?? null;

  const trimmedCustom = customText.trim();
  const declaredText =
    selected === "custom"
      ? trimmedCustom
      : selected !== null
        ? actions[selected]
        : "";
  const canDeclare = triggerChosen && declaredText.length > 0;

  const personalCode = def.showPersonalCode
    ? compilePersonalCode(profile, lessonResponses)
    : null;

  function chooseSuggestion(kind: SuggestionKind) {
    setSelected(kind);
    if (kind !== "custom") {
      setCustomText("");
      track("mission_action_selected", {
        missionNumber: def?.number,
        suggestionType: kind,
      });
    } else {
      track("mission_action_customized", { missionNumber: def?.number });
    }
  }

  async function declare() {
    if (submitting.current || !def || !canDeclare) return;
    submitting.current = true;
    setPending(true);
    try {
      await store.createMission({
        trigger,
        action_text: declaredText.slice(0, 140),
        action_category: selected === "custom" ? "custom" : selected,
        mission_number: def.number,
        question_answer: savedAnswer,
      });
      track("mission_action_declared", {
        missionNumber: def.number,
        selectedTrigger: trigger,
        suggestionType: selected,
        timeSinceMissionOpened: Date.now() - openedAt.current,
      });
      setStarOpen(false);
      setView("auto");
    } catch {
      showToast("Couldn't save your action. Please try again.", {
        retry: () => void declare(),
      });
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  async function logProof() {
    if (submitting.current || !row || !proofText.trim()) return;
    submitting.current = true;
    setPending(true);
    try {
      const completed = await store.completeMission(row.id, {
        reflection: proofText,
        photo_url: photo,
      });
      track("mission_action_completed", {
        missionNumber: def?.number,
        selectedTrigger: completed.trigger,
        timeSinceMissionOpened: Date.now() - openedAt.current,
      });
      if (photo) track("proof_photo_added", { missionNumber: def?.number });
      const after = computeStats(
        missions?.map((m) => (m.id === completed.id ? completed : m)) ?? [],
      );
      if (after.missionsCompleted === MISSION_COUNT) {
        track("mission_30_completed");
      }
      setView("confirmation");
    } catch {
      showToast("Couldn't log your proof. Please try again.", {
        retry: () => void logProof(),
      });
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  async function abandon() {
    if (!row) return;
    setPending(true);
    try {
      await store.deleteMission(row.id);
      setConfirmAbandon(false);
      setSelected(null);
      setCustomText("");
      setView("auto");
    } catch {
      showToast("Couldn't reset this Mission. Please try again.");
    } finally {
      setPending(false);
    }
  }

  async function saveEditedAction() {
    if (!row) return;
    const trimmed = editText.trim();
    if (!trimmed) return;
    setPending(true);
    try {
      await store.updateMission(row.id, { action_text: trimmed.slice(0, 140) });
      setEditingAction(false);
    } catch {
      showToast("Couldn't save that. Please try again.");
    } finally {
      setPending(false);
    }
  }

  /* ---------- confirmation (just logged) ---------- */

  if (view === "confirmation") {
    const done = computeStats(missions).missionsCompleted;
    const allDone = done >= MISSION_COUNT;
    const next = nextMissionNumber(missions);
    return (
      <main className="fade-in flex flex-1 flex-col pt-10">
        <Headline className="text-center">
          {allDone && def.number === 30 ? "30-DAY MISSION COMPLETE" : "PROOF LOGGED."}
        </Headline>
        <p className="font-display text-gold-gradient mt-4 text-center text-[24px] leading-snug">
          You acted with {TRIGGERS[row?.trigger ?? trigger].provedWith}.
        </p>
        <p className="mt-6 text-center text-[17px] text-ink-1">
          {allDone
            ? "You completed thirty real-world actions and created thirty pieces of evidence. Keep using the Mission Log whenever you need Honor, Courage, or Commitment."
            : "This is evidence of the man you are becoming."}
        </p>
        <div className="mt-10 space-y-3">
          {allDone ? (
            <>
              <Button onClick={() => router.push("/home")}>
                LOG A NEW ACTION
              </Button>
              <Button
                variant="secondary"
                onClick={() => router.push("/personal-code")}
              >
                VIEW MY PERSONAL CODE
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() =>
                  router.push(next ? `/missions/${next}` : "/missions")
                }
              >
                CONTINUE TO THE NEXT MISSION
              </Button>
              <Button variant="secondary" onClick={() => router.push("/log")}>
                VIEW MY MISSION LOG
              </Button>
            </>
          )}
        </div>
      </main>
    );
  }

  const header = (
    <>
      <div className="flex items-center justify-between">
        <NavAction kind="back" href="/missions" />
        <span className="eyebrow text-ink-2">
          MISSION {def.number} OF {MISSION_COUNT}
        </span>
        <span
          className={cn(
            "eyebrow",
            status === "completed"
              ? "text-[var(--success)]"
              : status === "in_progress"
                ? "text-gold-300"
                : "text-ink-2",
          )}
        >
          {status === "completed"
            ? "COMPLETE"
            : status === "in_progress"
              ? "IN PROGRESS"
              : "NOT STARTED"}
        </span>
      </div>
      <Headline level={2} className="mt-6">
        {def.title}
      </Headline>
    </>
  );

  /* ---------- completed ---------- */

  if (status === "completed" && row) {
    const answer = savedAnswer ?? row.question_answer;
    return (
      <main className="pt-2 pb-8">
        {header}
        <p className="mt-4 text-[15px] leading-relaxed text-ink-1">{def.idea}</p>

        {answer && (
          <GlassCard className="mt-6">
            <Eyebrow tone="gold">YOUR ANSWER</Eyebrow>
            <p className="mt-2 text-[13px] leading-snug text-ink-2">
              {def.question}
            </p>
            <p className="mt-3 text-[17px] leading-relaxed whitespace-pre-wrap text-ink-0">
              {answer}
            </p>
          </GlassCard>
        )}

        <GlassCard className="mt-6 border-[rgba(201,166,72,.35)]">
          <div className="flex items-center gap-2">
            <Check aria-hidden size={18} className="text-gold-300" />
            <Eyebrow tone="gold">
              PROOF LOGGED{row.completed_at ? ` · ${formatDate(row.completed_at)}` : ""}
            </Eyebrow>
          </div>
          <p className="eyebrow mt-4 text-ink-2">DECLARED</p>
          <p className="mt-1 text-[17px] text-ink-0">{row.action_text}</p>
          {row.reflection && (
            <>
              <p className="eyebrow mt-4 text-ink-2">COMPLETED</p>
              <p className="mt-1 text-[17px] text-ink-0">{row.reflection}</p>
            </>
          )}
          {row.photo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={row.photo_url}
              alt="Your proof photo"
              className="mt-4 w-full rounded-[14px]"
            />
          )}
        </GlassCard>

        <div className="mt-6 space-y-3">
          <Link href={`/log/${row.id}`} className="block">
            <Button variant="secondary">VIEW IN MISSION LOG</Button>
          </Link>
          {nextMissionNumber(missions) && (
            <Link
              href={`/missions/${nextMissionNumber(missions)}`}
              className="block"
            >
              <Button>CONTINUE TO THE NEXT MISSION</Button>
            </Link>
          )}
        </div>
      </main>
    );
  }

  /* ---------- in progress ---------- */

  if (status === "in_progress" && row) {
    if (view === "proof-form") {
      return (
        <main className="pt-2 pb-8">
          <div className="flex items-center justify-between">
            <NavAction kind="back" onClick={() => setView("auto")} />
            <span className="eyebrow text-ink-2">
              MISSION {def.number} OF {MISSION_COUNT}
            </span>
            <span className="h-12 w-12" />
          </div>
          <Headline className="mt-6">RECORD THE EVIDENCE</Headline>
          <p className="font-display mt-5 text-[22px] leading-tight text-ink-0">
            {row.action_text}
          </p>
          <div className="mt-7">
            <Field
              label="What did you do?"
              value={proofText}
              onChange={setProofText}
              maxLength={PROOF_TEXT_MAX}
              multiline
              autoFocus
              placeholder="I sent the email and asked for the conversation."
            />
          </div>
          <div className="mt-4">
            <PhotoInput value={photo} onChange={setPhoto} />
            {def.photoEncouraged && !photo && (
              <p className="mt-2 text-[13px] text-ink-2">
                A photo makes this proof easy to revisit.
              </p>
            )}
          </div>
          <div className="mt-8">
            <Button
              loading={pending}
              disabled={!proofText.trim()}
              onClick={() => void logProof()}
            >
              LOG THE PROOF
            </Button>
          </div>
        </main>
      );
    }

    return (
      <main className="pt-2 pb-8">
        {header}

        <GlassCard accent={row.trigger} className="mt-6">
          <Eyebrow accent={row.trigger} tone="gold">
            YOUR ACTION · {TRIGGERS[row.trigger].name}
          </Eyebrow>
          {editingAction ? (
            <div className="mt-4 space-y-3">
              <Field
                value={editText}
                onChange={setEditText}
                maxLength={140}
                autoFocus
                aria-label="Your action"
              />
              <Button
                loading={pending}
                disabled={!editText.trim()}
                onClick={() => void saveEditedAction()}
              >
                SAVE
              </Button>
              <Button variant="ghost" onClick={() => setEditingAction(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <p className="font-display mt-3 text-[26px] leading-tight text-ink-0">
              {row.action_text}
            </p>
          )}
        </GlassCard>

        {!editingAction && (
          <div className="mt-6 space-y-3">
            <Button onClick={() => setView("proof-form")}>I DID IT</Button>
            <Button
              variant="secondary"
              onClick={() => {
                setEditText(row.action_text);
                setEditingAction(true);
              }}
            >
              Edit action
            </Button>
            <Button variant="ghost" onClick={() => setConfirmAbandon(true)}>
              Reset this Mission
            </Button>
          </div>
        )}

        {/* The full answer stays reviewable (and editable) mid-Mission. */}
        <section className="mt-8">
          <Eyebrow tone="gold">YOUR ANSWER</Eyebrow>
          <p className="mt-2 text-[13px] text-ink-2">
            Private. Only you ever see this.
          </p>
          <div className="mt-4">
            <QuestionField
              slug={def.slug}
              label={def.question}
              saved={savedAnswer}
            />
          </div>
        </section>

        <Sheet
          open={confirmAbandon}
          title="RESET THIS MISSION?"
          note="Your declared action will be removed and the Mission goes back to Not Started. Nothing you've logged elsewhere changes."
          onClose={() => setConfirmAbandon(false)}
        >
          <Button variant="danger" loading={pending} onClick={() => void abandon()}>
            RESET MISSION
          </Button>
          <Button variant="ghost" onClick={() => setConfirmAbandon(false)}>
            Cancel
          </Button>
        </Sheet>
      </main>
    );
  }

  /* ---------- not started ---------- */

  return (
    <main className="pt-2 pb-8">
      {header}

      <p className="mt-4 text-[15px] leading-relaxed text-ink-1">{def.idea}</p>

      {def.youtubeId && (
        <MissionVideo
          youtubeId={def.youtubeId}
          title={def.title}
          missionNumber={def.number}
        />
      )}

      {/* Scent Trigger — recommended, always changeable. */}
      <Eyebrow tone="gold" className="mt-7">
        {def.recommendedTrigger
          ? `RECOMMENDED: ${TRIGGERS[def.recommendedTrigger].name}`
          : "CHOOSE YOUR VALUE"}
      </Eyebrow>
      <div className="mt-3 flex gap-2">
        {TRIGGER_ORDER.map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={triggerChosen && trigger === value}
            onClick={() => setChosenTrigger(value)}
            className={cn(
              "glass flex min-h-12 flex-1 items-center justify-center gap-2 rounded-[14px] px-2 text-[13px] tracking-[0.04em] uppercase",
              triggerChosen && trigger === value
                ? "border-[var(--gold-500)] text-ink-0"
                : "text-ink-2",
            )}
          >
            <AccentDot trigger={value} />
            {TRIGGERS[value].name}
          </button>
        ))}
      </div>

      {def.showPersonalCode && personalCode && (
        <GlassCard className="mt-7">
          <Eyebrow tone="gold">MY PERSONAL CODE</Eyebrow>
          <dl className="mt-4 space-y-3">
            {personalCode.map((line) => (
              <div key={line.key}>
                <dt className="text-[13px] text-ink-2">{line.label}</dt>
                <dd className="mt-0.5 text-[15px] leading-snug text-ink-0">
                  {line.value ?? (
                    <span className="text-ink-2">
                      Not written yet — {line.source}.
                    </span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
          <Link
            href="/personal-code"
            className="mt-4 inline-flex min-h-12 items-center text-[15px] text-gold-300"
          >
            Open my Personal Code
          </Link>
        </GlassCard>
      )}

      {/* One question. One answer is enough. */}
      <section className="mt-7">
        <Eyebrow tone="gold">QUESTION</Eyebrow>
        <p className="mt-2 text-[13px] text-ink-2">
          Private. Only you ever see this.
        </p>
        <div className="mt-4">
          <QuestionField
            slug={def.slug}
            label={def.question}
            saved={savedAnswer}
            initial={def.prefillIdentity ? profile.identity_statement : null}
          />
        </div>
        {def.exampleAnswers && (
          <ul className="mt-2 space-y-1.5 text-[13px] leading-snug text-ink-2">
            {def.exampleAnswers.map((example) => (
              <li key={example}>· {example}</li>
            ))}
          </ul>
        )}
      </section>

      {/* Suggested actions. */}
      <section className="mt-8" role="radiogroup" aria-label="Your action">
        <Eyebrow tone="gold">YOUR ACTION</Eyebrow>
        <div className="mt-3 space-y-3">
          {(["quick", "standard", "bold"] as const).map((kind) => (
            <button
              key={kind}
              type="button"
              role="radio"
              aria-checked={selected === kind}
              onClick={() => chooseSuggestion(kind)}
              className={cn(
                "glass block w-full rounded-[14px] px-4 py-4 text-left transition-colors",
                selected === kind && "border-[var(--gold-500)]",
              )}
            >
              <span className="eyebrow block text-gold-300">
                {SUGGESTION_LABEL[kind]}
              </span>
              <span
                className={cn(
                  "mt-1.5 block text-[17px] leading-snug",
                  selected === kind ? "text-ink-0" : "text-ink-1",
                )}
              >
                {actions[kind]}
              </span>
            </button>
          ))}

          <button
            type="button"
            role="radio"
            aria-checked={selected === "custom"}
            onClick={() => chooseSuggestion("custom")}
            className={cn(
              "glass flex w-full items-center gap-3 rounded-[14px] px-4 py-4 text-left transition-colors",
              selected === "custom"
                ? "border-[var(--gold-500)]"
                : "border-[rgba(201,166,72,.38)]",
            )}
          >
            <PenLine aria-hidden size={20} className="shrink-0 text-gold-300" />
            <span className="min-w-0 flex-1">
              <span className="font-display block text-[18px] leading-none text-ink-0">
                WRITE MY OWN ACTION
              </span>
              <span className="mt-1.5 block text-[13px] text-ink-2">
                Tap to declare your own action
              </span>
            </span>
          </button>

          {selected === "custom" && (
            <Field
              value={customText}
              onChange={setCustomText}
              placeholder="One action. Short. Specific."
              maxLength={140}
              autoFocus
              aria-label="Your action"
            />
          )}
        </div>
      </section>

      <div className="mt-8">
        <Button disabled={!canDeclare} onClick={() => setStarOpen(true)}>
          DECLARE MY ACTION
        </Button>
      </div>

      {/* The S.T.A.R. action sheet — the last look before committing. */}
      <Sheet
        open={starOpen}
        title="S.T.A.R."
        onClose={() => setStarOpen(false)}
      >
        <dl className="space-y-4">
          <div>
            <dt className="eyebrow text-gold-300">SELECT YOUR FRAGRANCE</dt>
            <dd className="mt-1 text-[17px] text-ink-0">
              {TRIGGERS[trigger].provedWith}
            </dd>
          </div>
          <div>
            <dt className="eyebrow text-gold-300">TRIGGER</dt>
            <dd className="mt-1 text-[15px] leading-snug text-ink-1">
              {TRIGGERS[trigger].starRecall}
            </dd>
          </div>
          <div>
            <dt className="eyebrow text-gold-300">ACT</dt>
            <dd className="mt-1 text-[17px] text-ink-0">{declaredText}</dd>
          </div>
          <div>
            <dt className="eyebrow text-gold-300">RECORD</dt>
            <dd className="mt-1 text-[15px] leading-snug text-ink-1">
              Document the action as proof.
            </dd>
          </div>
        </dl>
        <Button loading={pending} onClick={() => void declare()}>
          TAKE ACTION NOW
        </Button>
      </Sheet>
    </main>
  );
}

export default function MissionDetailPage(props: {
  params: Promise<{ number: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <MissionDetailInner {...props} />
    </Suspense>
  );
}
