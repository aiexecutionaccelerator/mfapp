"use client";

import { Check } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import FragranceCue from "@/components/FragranceCue";
import { useInView } from "@/components/motion/useInView";
import PhotoInput from "@/components/PhotoInput";
import { BlockerPanel, ContextPanels } from "@/components/mission/ContextPanels";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import {
  CURRICULUM_VERSION,
  DEFAULT_IDENTITY,
  FOCUS_AREAS,
  FREQUENCIES,
  type MissionDef,
} from "@/content/missions";
import { TRIGGERS } from "@/content/triggers";
import { track } from "@/lib/analytics";
import {
  SHOWS_RECENT_ACTIONS,
  blockersFor,
  contextFor,
  isLegacy,
  primaryLabel,
  recentActions,
  recordText,
  textLimitFor,
  validateRecord,
  withStarter,
} from "@/lib/curriculum";
import { store } from "@/lib/data/store";
import {
  ConflictError,
  ValidationError,
  type Draft,
  type Mission,
  type MissionContext,
  type Profile,
  type RecordInput,
  type Trigger,
} from "@/lib/data/types";
import { cn, tomorrowLocal } from "@/lib/utils";

export type FormMode = "new" | "edit" | "revise";

/**
 * The S.T.A.R. steps of one Mission, as a form. One template for all 30:
 *
 *   S Select  — the shelf (suggested, changeable) and what the chosen value
 *               means here.
 *   T Trigger — spray. The same for every Mission.
 *   A Act     — the task, plus any saved context it works with.
 *   R Record  — the question, tap-to-start openings, his own words, the
 *               Mission's own fields, and the honest save.
 *
 * Simplified 18 Nov 2026 (Antonio, after watching a first-time user): the
 * time and kind line, "Choose one way to do it", the note, Done when and
 * "Need an example?" are gone from the screen. The three ways to do it live
 * on as the starters on Record, which fill the start of his answer. Drafts
 * save themselves; there is no SAVE DRAFT button.
 *
 * Modes: "new" completes the Mission (drafts autosave). "edit" changes a
 * saved record (SAVE CHANGES). "revise" moves a first-curriculum record to
 * the revised task, keeping the old wording in its history.
 */
const AUTOSAVE_MS = 1200;

export default function MissionForm({
  def,
  mode,
  record,
  draft,
  missions,
  profile,
  onSaved,
  onCancel,
}: {
  def: MissionDef;
  mode: FormMode;
  record?: Mission | null;
  draft?: Draft | null;
  missions: Mission[];
  profile: Profile;
  onSaved: (record: Mission) => void;
  onCancel?: () => void;
}) {
  const editing = mode === "edit" && !!record;

  const initialText = editing
    ? recordText(record)
    : (draft?.text ??
      (def.number === 13 ? (profile.identity_statement ?? DEFAULT_IDENTITY) : ""));

  const [text, setText] = useState(initialText);
  const [trigger, setTrigger] = useState<Trigger>(
    (editing ? record.trigger : draft?.trigger) ?? def.recommendedTrigger,
  );
  const [focus, setFocus] = useState<string | null>(
    (editing ? record.focus_area : draft?.focus_area) ?? null,
  );
  const [frequency, setFrequency] = useState<string | null>(
    (editing ? record.frequency : draft?.frequency) ?? null,
  );
  const [reviewDate, setReviewDate] = useState<string>(
    (editing ? record.review_date : draft?.review_date) ?? "",
  );
  const [photo, setPhoto] = useState<string | null>(
    editing ? record.photo_url : null,
  );
  const [confirmed, setConfirmed] = useState(false);
  const [aimChoice, setAimChoice] = useState<"current" | "previous">("current");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<"save" | null>(null);
  const [draftState, setDraftState] = useState<"idle" | "saving" | "saved" | "failed">(
    draft ? "saved" : "idle",
  );
  const submitting = useRef(false);
  const textRef = useRef<HTMLTextAreaElement>(null);
  /** Set by his own edits; the autosave only writes what he changed. */
  const dirty = useRef(false);
  const timer = useRef<number | null>(null);
  const inFlight = useRef<Promise<unknown> | null>(null);
  /** Once he completes it, no late autosave may recreate a draft. */
  const finished = useRef(false);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const errorId = useId();

  const isAction = def.kind === "action";
  const isPlan = def.number === 27 || def.number === 30;

  /* ---- context: live for unfinished work, frozen once completed ---- */
  const live = contextFor(def.number, missions);
  const previousAim =
    !editing && draft?.context?.aim && draft.context.aim !== live.aim
      ? { focus: draft.context.focus ?? null, aim: draft.context.aim }
      : null;
  const context: MissionContext = editing
    ? (record.context ?? {})
    : previousAim && (aimChoice === "previous" || !live.aim)
      ? { ...live, focus: previousAim.focus, aim: previousAim.aim }
      : live;
  const blockers = editing ? [] : blockersFor(def.number, missions);
  const recent =
    !editing && SHOWS_RECENT_ACTIONS.has(def.number)
      ? recentActions(missions, { exclude: def.number })
      : null;

  function input(): RecordInput {
    return {
      mission_number: def.number,
      trigger,
      text,
      confirmed: isAction ? confirmed || editing : true,
      context,
      focus_area: def.number === 21 ? focus : null,
      frequency: isPlan ? frequency : null,
      review_date: isPlan ? reviewDate || null : null,
      photo_url: def.photo ? photo : null,
    };
  }

  function fail(message: string) {
    setError(message);
    // Keep focus usable: move it to the message beside the form.
    requestAnimationFrame(() => errorRef.current?.focus());
  }

  async function save() {
    if (submitting.current) return;
    setError(null);
    const values = input();
    const problem = validateRecord(values, missions, {
      previousReviewDate: editing ? record.review_date : null,
      skipPrerequisites: editing,
      textOnly: editing && isLegacy(record),
    });
    if (problem) return fail(problem);

    submitting.current = true;
    setPending("save");
    // Stop the autosave and let any draft write land first, so it can't
    // race the record or recreate a draft after it.
    if (timer.current) window.clearTimeout(timer.current);
    if (inFlight.current) await inFlight.current;
    finished.current = true;
    try {
      const saved =
        mode === "edit" && record
          ? await store.editRecord(record, {
              text: values.text,
              trigger: values.trigger,
              focus_area: values.focus_area,
              frequency: values.frequency,
              review_date: values.review_date,
              ...(def.photo ? { photo_url: values.photo_url } : {}),
            })
          : mode === "revise" && record
            ? await store.reviseLegacy(record, values)
            : await store.saveRecord(values);
      track(editing ? "proof_entry_edited" : "mission_record_saved", {
        missionNumber: def.number,
        kind: def.kind,
        selectedTrigger: trigger,
      });
      onSaved(saved);
    } catch (cause) {
      finished.current = false;
      fail(
        cause instanceof ValidationError || cause instanceof ConflictError
          ? cause.message
          : "Couldn't save. Check your connection and try again. Your text is still here.",
      );
    } finally {
      submitting.current = false;
      setPending(null);
    }
  }

  async function writeDraft() {
    if (finished.current || !dirty.current) return;
    // Choosing a bottle alone isn't a draft: wait for words (19 Nov).
    if (!text.trim() && !draft) return;
    dirty.current = false;
    setDraftState("saving");
    const job = store
      .saveDraft({
        mission_number: def.number,
        curriculum_version: CURRICULUM_VERSION,
        text,
        trigger,
        focus_area: focus,
        frequency,
        review_date: reviewDate || null,
        context,
      })
      .then(() => {
        setDraftState("saved");
        track("mission_draft_saved", { missionNumber: def.number, auto: true });
      })
      .catch(() => {
        // Keep it marked and try again shortly; his text stays on screen.
        dirty.current = true;
        setDraftState("failed");
        timer.current = window.setTimeout(() => void latest.current(), 5000);
      });
    inFlight.current = job;
    await job;
    if (inFlight.current === job) inFlight.current = null;
  }

  // Drafts save themselves a moment after he stops typing or choosing, and
  // once more if he leaves the page. Never while editing a saved record.
  const latest = useRef(writeDraft);
  useEffect(() => {
    latest.current = writeDraft;
  });
  useEffect(() => {
    if (editing || !dirty.current) return;
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => void latest.current(), AUTOSAVE_MS);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [editing, text, trigger, focus, frequency, reviewDate]);
  useEffect(() => {
    if (editing) return;
    const flush = () => void latest.current();
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [editing]);

  /** His own change: mark it for the autosave. */
  function touch<T>(set: (value: T) => void) {
    return (value: T) => {
      dirty.current = true;
      set(value);
    };
  }

  /**
   * A starter fills the start of his answer and puts the cursor after it.
   * An empty box takes it as is; anything already there is kept and the
   * starter goes on a new line (19 Nov: a tap used to wipe Mission 13's
   * prefilled statement, and a second chip replaced the first).
   *
   * "I acted on my Courage line by…" also sets the Scent Trigger to that
   * value, so the credit follows the code line he acted on (Mission 14).
   */
  function applyStarter(starter: string) {
    const next = withStarter(text, starter, def.starters);
    if (next !== text) touch(setText)(next.slice(0, textLimitFor(def.number)));
    const value = starter.match(/\bmy (Honor|Courage|Commitment) line\b/)?.[1];
    if (value) touch(setTrigger)(value.toLowerCase() as Trigger);
    track("mission_starter_used", { missionNumber: def.number });
    requestAnimationFrame(() => {
      const el = textRef.current;
      if (!el) return;
      el.focus({ preventScroll: true });
      el.setSelectionRange(el.value.length, el.value.length);
      el.scrollIntoView({ block: "center", behavior: "smooth" });
    });
  }

  return (
    <>
      <StarStep letter="S" name="Select" detail="your Scent Trigger">
        <FragranceCue
          label={null}
          value={trigger}
          recommended={def.recommendedTrigger}
          onChange={touch(setTrigger)}
        />
      </StarStep>

      <StarStep letter="T" name="Trigger">
        <p className="text-[17px] text-ink-0">
          Spray your Scent Trigger.
        </p>
      </StarStep>

      <StarStep letter="A" name="Act">
        <p className="text-[17px] leading-snug text-ink-0">{def.action}</p>

        {previousAim && live.aim && (
          <fieldset className="mt-4 rounded-[14px] border border-[rgba(201,166,72,.45)] p-4">
            <legend className="eyebrow px-1 text-gold-300">YOUR AIM CHANGED</legend>
            <p className="text-[14px] leading-snug text-ink-1">
              You started this draft working toward a different aim. Which one is
              this Mission for? Your draft text stays either way.
            </p>
            {(
              [
                ["previous", "The aim I started with", previousAim.aim],
                ["current", "My current aim", live.aim],
              ] as const
            ).map(([value, label, aim]) => (
              <label key={value} className="mt-3 flex cursor-pointer items-start gap-3">
                <input
                  type="radio"
                  name="aim-choice"
                  checked={aimChoice === value}
                  onChange={() => touch(setAimChoice)(value)}
                  className="mt-1 h-5 w-5 shrink-0 accent-[var(--gold-500)]"
                />
                <span>
                  <span className="block text-[13px] text-ink-2">{label}</span>
                  <span className="block text-[15px] text-ink-0">{aim}</span>
                </span>
              </label>
            ))}
          </fieldset>
        )}

        <ContextPanels
          context={context}
          missionNumber={def.number}
          recent={recent}
          selectableCode={def.number === 29 && !editing}
        />
        <BlockerPanel blockers={blockers} />
      </StarStep>

      <StarStep letter="R" name="Record" last>
        <p id={`prompt-${def.number}`} className="text-[17px] leading-snug text-ink-0">
          {def.prompt}
        </p>

        {/* Tap one to start the sentence, then finish it in your own words. */}
        <div role="group" aria-label="Start with" className="mt-3 flex flex-wrap gap-2">
          {def.starters.map((starter) => (
            <button
              key={starter}
              type="button"
              onClick={() => applyStarter(starter)}
              className="press min-h-11 rounded-full border border-[var(--line-strong)] bg-[rgba(18,23,34,.6)] px-3.5 py-2 text-left text-[14px] leading-snug text-ink-1 transition-colors duration-200 hover:border-[var(--gold-500)] hover:text-ink-0 active:border-[var(--gold-500)]"
            >
              {/[.!?]$/.test(starter.trim()) ? starter.trim() : `${starter.trim()}…`}
            </button>
          ))}
        </div>

        <Field
          className="mt-3"
          variant="prominent"
          aria-label={def.prompt}
          value={text}
          onChange={touch(setText)}
          textareaRef={textRef}
          autoComplete="off"
          maxLength={textLimitFor(def.number)}
          multiline
          rows={4}
          placeholder={
            def.starters.every((x) => /[.!?]$/.test(x.trim()))
              ? "Pick one above, or write your own."
              : "Tap a starter above, or write your own."
          }
          aria-describedby={error ? errorId : undefined}
        />

        {def.number === 21 && (
          <ChoiceGroup
            legend="Focus area"
            options={FOCUS_AREAS}
            value={focus}
            onChange={touch(setFocus)}
          />
        )}

        {isPlan && (
          <>
            <ChoiceGroup
              legend="How often"
              options={FREQUENCIES}
              value={frequency}
              onChange={touch(setFrequency)}
            />
            <div className="mt-5">
              <label
                htmlFor={`review-${def.number}`}
                className="eyebrow mb-2 block text-gold-300"
              >
                REVIEW DATE
              </label>
              <input
                id={`review-${def.number}`}
                type="date"
                min={editing && record.review_date === reviewDate ? undefined : tomorrowLocal()}
                value={reviewDate}
                onChange={(e) => touch(setReviewDate)(e.target.value)}
                className="min-h-14 w-full rounded-[14px] border border-[var(--line)] bg-[rgba(18,23,34,.6)] px-4 text-[17px] text-ink-0 [color-scheme:dark] focus:border-[var(--gold-500)] focus:outline-none"
              />
              <p className="mt-1 text-[13px] text-ink-2">
                Choose a future date to review your progress after several
                repetitions.
              </p>
            </div>
          </>
        )}

        {def.photo && (
          <div className="mt-4">
            <PhotoInput value={photo} onChange={setPhoto} />
          </div>
        )}

        {isAction && !editing && (
          <label className="mt-5 flex min-h-12 cursor-pointer items-center gap-3 rounded-[14px] border border-[var(--line)] px-4">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="h-5 w-5 shrink-0 accent-[var(--gold-500)]"
            />
            <span className="text-[16px] text-ink-0">I have taken this action.</span>
          </label>
        )}

        <p
          id={errorId}
          ref={errorRef}
          tabIndex={-1}
          role="alert"
          className={cn(
            "mt-4 text-[15px] leading-snug text-[var(--danger)] outline-none",
            !error && "sr-only",
          )}
        >
          {error}
        </p>

        {/* The page's one primary action spans the full width, out from
            under the step indent, so it never wraps. */}
        <div className="mt-4 -ml-12 space-y-2">
          {/* Which bottle this saves with, right where he commits (Antonio
              couldn't tell which he had picked, 23 Nov). */}
          {!editing && (
            <p className="text-center text-[14px] text-ink-2">
              Recording with{" "}
              <span className="font-semibold text-ink-0">{TRIGGERS[trigger].provedWith}</span>
              {trigger !== def.recommendedTrigger && (
                <> (this Mission suggests {TRIGGERS[def.recommendedTrigger].provedWith})</>
              )}
            </p>
          )}
          <Button loading={pending === "save"} onClick={() => void save()}>
            {primaryLabel(def, editing)}
          </Button>
          {editing ? (
            <Button variant="ghost" onClick={onCancel}>
              CANCEL
            </Button>
          ) : (
            <p
              role="status"
              className="flex min-h-6 items-center justify-center gap-1.5 text-center text-[13px] text-ink-2"
            >
              {/* One message at a time: an error replaces the draft note (25 Nov). */}
              {!error && draftState === "saving" && "Saving…"}
              {!error && draftState === "saved" && (
                <>
                  <Check aria-hidden size={14} className="text-gold-300" />
                  Draft saved. It isn&apos;t complete until you tap the button above.
                </>
              )}
              {!error && draftState === "failed" &&
                "Couldn't save yet. Your text is still here; we'll try again."}
            </p>
          )}
        </div>
      </StarStep>
    </>
  );
}

function ChoiceGroup({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string;
  options: readonly string[];
  value: string | null;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className="mt-5">
      <legend className="eyebrow mb-2 text-gold-300">{legend.toUpperCase()}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const checked = value === option;
          return (
            <label
              key={option}
              className={cn(
                "flex min-h-11 cursor-pointer items-center rounded-full border px-4 text-[15px] transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--gold-500)]",
                checked
                  ? "border-[var(--gold-500)] bg-[rgba(201,166,72,.15)] text-ink-0"
                  : "border-[var(--line)] text-ink-1",
              )}
            >
              <input
                type="radio"
                name={legend}
                value={option}
                checked={checked}
                onChange={() => onChange(option)}
                className="sr-only"
              />
              {checked && <span aria-hidden className="mr-1.5 text-gold-300">✓</span>}
              {option}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/**
 * One step of S.T.A.R.: the letter, the step's name, and what belongs to it.
 * A hairline runs down from each letter to the next so the four read as one
 * sequence rather than four boxes.
 */
export function StarStep({
  letter,
  name,
  detail,
  last = false,
  children,
}: {
  letter: string;
  name: string;
  /** Grey words after the step's name: SELECT your scent trigger. */
  detail?: string;
  last?: boolean;
  children: React.ReactNode;
}) {
  // Each step lights its letter and fills the rail to the next one as it
  // scrolls into view, so the four read as a path he's moving down.
  const { ref, inView } = useInView<HTMLElement>();
  return (
    <section
      ref={ref}
      // Always visible; scrolling in only lights the letter and the rail.
      // (Hiding the steps until a scroll observer fired left mission
      // pages showing a subtitle with no body, 19 Nov.)
      className={cn("relative mt-7 pl-12", inView && "is-visible")}
      aria-label={`${letter}: ${name}`}
    >
      <span
        aria-hidden
        className="star-letter font-display text-gold-gradient absolute top-0 left-0 w-8 text-center text-[30px] leading-none"
      >
        {letter}
      </span>
      {!last && (
        <span
          aria-hidden
          className="star-rail absolute top-10 -bottom-5 left-4 w-px"
        />
      )}
      <p className="eyebrow pt-1.5 text-gold-300">
        {name.toUpperCase()}
        {detail && <span className="text-ink-2"> {detail.toUpperCase()}</span>}
      </p>
      <div className="mt-2">{children}</div>
    </section>
  );
}
