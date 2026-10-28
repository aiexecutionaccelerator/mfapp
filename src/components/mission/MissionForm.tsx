"use client";

import { Info } from "lucide-react";
import { useId, useRef, useState } from "react";
import FragranceCue from "@/components/FragranceCue";
import { useInView } from "@/components/motion/useInView";
import MissionVideo from "@/components/MissionVideo";
import PhotoInput from "@/components/PhotoInput";
import { BlockerPanel, ContextPanels } from "@/components/mission/ContextPanels";
import Button from "@/components/ui/Button";
import Disclosure from "@/components/ui/Disclosure";
import Field from "@/components/ui/Field";
import {
  CURRICULUM_VERSION,
  DEFAULT_IDENTITY,
  FOCUS_AREAS,
  FREQUENCIES,
  type MissionDef,
} from "@/content/missions";
import { track } from "@/lib/analytics";
import {
  KIND_LABELS,
  SHOWS_RECENT_ACTIONS,
  blockersFor,
  contextFor,
  primaryLabel,
  recentActions,
  recordText,
  textLimitFor,
  validateRecord,
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
import { cn, relativeTime, tomorrowLocal } from "@/lib/utils";

export type FormMode = "new" | "edit" | "revise";

/**
 * The S.T.A.R. steps of one Mission, as a form. One template for all 30:
 *
 *   S Select  — why this value fits, and the shelf (suggested, changeable).
 *   T Trigger — spray. The same for every Mission.
 *   A Act     — the task, its time and kind, three optional approaches,
 *               his saved context, any note, and Done when.
 *   R Record  — the question, a field in his own words, optional examples,
 *               the Mission's own fields, and the honest save.
 *
 * Modes: "new" completes the Mission (or saves a draft). "edit" changes a
 * saved record (SAVE CHANGES). "revise" moves a first-curriculum record to
 * the revised task, keeping the old wording in its history.
 */
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
  const [approach, setApproach] = useState<number | null>(null);
  const [aimChoice, setAimChoice] = useState<"current" | "previous">("current");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<"save" | "draft" | null>(null);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(
    draft?.updated_at ?? null,
  );
  const submitting = useRef(false);
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
    });
    if (problem) return fail(problem);

    submitting.current = true;
    setPending("save");
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

  async function saveDraft() {
    if (submitting.current) return;
    setError(null);
    submitting.current = true;
    setPending("draft");
    try {
      const saved = await store.saveDraft({
        mission_number: def.number,
        curriculum_version: CURRICULUM_VERSION,
        text,
        trigger,
        focus_area: focus,
        frequency,
        review_date: reviewDate || null,
        context,
      });
      setDraftSavedAt(saved.updated_at);
      track("mission_draft_saved", { missionNumber: def.number });
    } catch {
      fail("Couldn't save your draft. Your text is still here. Try again.");
    } finally {
      submitting.current = false;
      setPending(null);
    }
  }

  return (
    <>
      <StarStep letter="S" name="Select">
        <p className="text-[15px] leading-snug text-ink-1">{def.select}</p>
        <FragranceCue
          label={null}
          value={trigger}
          recommended={def.recommendedTrigger}
          onChange={setTrigger}
          className="mt-3"
        />
      </StarStep>

      <StarStep letter="T" name="Trigger">
        <p className="text-[17px] text-ink-0">
          Spray the fragrance and breathe it in. Then begin the assigned task.
        </p>
      </StarStep>

      <StarStep letter="A" name="Act">
        <p className="text-[17px] leading-snug text-ink-0">{def.action}</p>
        <p className="mt-2 text-[13px] text-ink-2">
          {def.time} · {KIND_LABELS[def.kind]}
        </p>

        <Disclosure
          className="mt-4"
          label="Choose one way to do it"
          helper="Pick the option that fits your life, or use your own version of the same task."
          onOpen={() => track("mission_options_opened", { missionNumber: def.number })}
        >
          {/* Tap one to mark the way you'll do it. Optional, one at a time,
              tap again to clear. Never saved, never required (the spec: "not
              a scored quiz, required radio buttons, or three tasks"). */}
          <div className="space-y-2">
            {def.choices.map((choice, i) => {
              const picked = approach === i;
              return (
                <button
                  key={choice}
                  type="button"
                  aria-pressed={picked}
                  onClick={() => setApproach(picked ? null : i)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-[12px] border px-3 py-3 text-left text-[15px] leading-snug transition-all duration-200",
                    picked
                      ? "border-[var(--gold-500)] bg-[rgba(201,166,72,.1)] text-ink-0 shadow-[0_0_24px_rgba(201,166,72,.12)]"
                      : "border-[var(--line)] text-ink-1 hover:border-[rgba(201,166,72,.4)]",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "font-display flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[15px] leading-none transition-colors duration-200",
                      picked
                        ? "border-transparent bg-gold-gradient text-[#07090D]"
                        : "border-[rgba(201,166,72,.45)] text-gold-300",
                    )}
                  >
                    {picked ? "✓" : i + 1}
                  </span>
                  <span>{choice}</span>
                </button>
              );
            })}
          </div>
        </Disclosure>

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
                  onChange={() => setAimChoice(value)}
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

        {def.note && (
          <p className="mt-4 flex gap-2 text-[14px] leading-snug text-ink-1">
            <Info aria-hidden size={16} className="mt-0.5 shrink-0 text-gold-300" />
            <span>{def.note}</span>
          </p>
        )}

        <div className="mt-4 border-l-2 border-[var(--gold-500)] pl-3">
          <p className="eyebrow text-gold-300">DONE WHEN</p>
          <p className="mt-1 text-[15px] leading-snug text-ink-0">{def.doneWhen}</p>
        </div>

        {def.youtubeId && (
          <MissionVideo
            youtubeId={def.youtubeId}
            title={def.title}
            missionNumber={def.number}
          />
        )}
      </StarStep>

      <StarStep letter="R" name="Record" last>
        <Field
          variant="prominent"
          label={def.prompt}
          labelClassName="mb-3 block text-[17px] leading-snug text-ink-0"
          value={text}
          onChange={setText}
          maxLength={textLimitFor(def.number)}
          multiline
          rows={4}
          placeholder="In your own words."
          aria-describedby={error ? errorId : undefined}
        />

        <Disclosure
          className="mt-3"
          label="Need an example?"
          helper="For inspiration. Write what is true for you."
          onOpen={() => track("mission_examples_opened", { missionNumber: def.number })}
        >
          <ul className="space-y-2 text-[15px] leading-snug text-ink-1 italic">
            {def.examples.map((example) => (
              <li key={example}>“{example}”</li>
            ))}
          </ul>
        </Disclosure>

        {def.number === 21 && (
          <ChoiceGroup
            legend="Focus area"
            options={FOCUS_AREAS}
            value={focus}
            onChange={setFocus}
          />
        )}

        {isPlan && (
          <>
            <ChoiceGroup
              legend="How often"
              options={FREQUENCIES}
              value={frequency}
              onChange={setFrequency}
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
                onChange={(e) => setReviewDate(e.target.value)}
                className="min-h-14 w-full rounded-[14px] border border-[var(--line)] bg-[rgba(18,23,34,.6)] px-4 text-[17px] text-ink-0 [color-scheme:dark] focus:border-[var(--gold-500)] focus:outline-none"
              />
              <p className="mt-1 text-[13px] text-ink-2">
                A day after today, when you&apos;ll look back at how it went.
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
          <Button loading={pending === "save"} onClick={() => void save()}>
            {primaryLabel(def, editing)}
          </Button>
          {editing ? (
            <Button variant="ghost" onClick={onCancel}>
              CANCEL
            </Button>
          ) : (
            <Button
              variant="ghost"
              loading={pending === "draft"}
              onClick={() => void saveDraft()}
            >
              SAVE DRAFT FOR LATER
            </Button>
          )}
          <p role="status" className="text-center text-[13px] text-ink-2">
            {!editing && draftSavedAt
              ? `Draft saved ${relativeTime(draftSavedAt)}. It doesn't count as complete.`
              : ""}
          </p>
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
  last = false,
  children,
}: {
  letter: string;
  name: string;
  last?: boolean;
  children: React.ReactNode;
}) {
  // Each step lights its letter and fills the rail to the next one as it
  // scrolls into view, so the four read as a path he's moving down.
  const { ref, inView } = useInView<HTMLElement>();
  return (
    <section
      ref={ref}
      className={cn("reveal relative mt-7 pl-12", inView && "is-visible")}
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
      <p className="eyebrow pt-1.5 text-gold-300">{name.toUpperCase()}</p>
      <div className="mt-2">{children}</div>
    </section>
  );
}
