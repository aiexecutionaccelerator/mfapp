"use client";

import { Check, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense, use, useEffect, useRef, useState } from "react";
import NavAction from "@/components/NavAction";
import FragranceCue from "@/components/FragranceCue";
import MissionVideo from "@/components/MissionVideo";
import PhotoInput from "@/components/PhotoInput";
import ExampleChips from "@/components/ExampleChips";
import StarSystem from "@/components/StarSystem";
import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import Field from "@/components/ui/Field";
import GlassCard from "@/components/ui/GlassCard";
import Headline from "@/components/ui/Headline";
import Sheet from "@/components/ui/Sheet";
import Spinner from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { PERSONAL_CODE_SLUGS, getMissionDef } from "@/content/missions";
import { TRIGGERS } from "@/content/triggers";
import { track } from "@/lib/analytics";
import { store, useAppData } from "@/lib/data/store";
import { compilePersonalCode } from "@/lib/personalCode";
import { PROOF_TEXT_MAX, type Trigger } from "@/lib/data/types";
import {
  MISSION_COUNT,
  computeStats,
  nextMissionNumber,
  structuredMissionRow,
} from "@/lib/stats";
import { formatDate } from "@/lib/utils";

/**
 * The one reusable Mission Detail template — every Mission renders through
 * here, driven by `content/missions.ts` plus the user's state row.
 *
 * The screen IS the S.T.A.R. System, in order: why it matters, a reminder
 * of how S.T.A.R. works, then Select (the shelf), Trigger (spray), Act (the
 * sixty-second action) and Record (one field, one button). Recording
 * completes the Mission and writes the Proof — there is no declare step and
 * no in-progress state.
 */
function MissionDetailInner({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = use(params);
  const router = useRouter();
  const { showToast } = useToast();
  const { profile, missions, lessonResponses, error, refresh } = useAppData();

  const missionNumber = Number(number);
  const def = Number.isInteger(missionNumber)
    ? getMissionDef(missionNumber)
    : undefined;

  const [text, setText] = useState("");
  // The Mission recommends; he decides. Null means he has not overridden it.
  const [chosenTrigger, setChosenTrigger] = useState<Trigger | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [justLogged, setJustLogged] = useState(false);
  const [starOpen, setStarOpen] = useState(false);
  const submitting = useRef(false);
  const seeded = useRef(false);
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

  // The field never opens blank when it doesn't have to: Mission 13 opens on
  // his identity statement, a Mission with exactly one example opens on that
  // example, and a commitment opens on "I commit to ".
  useEffect(() => {
    if (seeded.current || !def || !profile) return;
    seeded.current = true;
    /* eslint-disable react-hooks/set-state-in-effect */
    if (def.prefillIdentity && profile.identity_statement) {
      setText(profile.identity_statement);
    } else if (def.examples?.length === 1) {
      setText(def.examples[0]);
    } else if (def.inputPrefix) {
      setText(def.inputPrefix);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [def, profile]);

  if (!def || !profile || !missions || !lessonResponses) {
    return (
      <main className="flex flex-1 items-center justify-center text-ink-2">
        <Spinner />
      </main>
    );
  }

  const row = structuredMissionRow(missions, def.number);
  const done = row?.status === "completed";
  const trigger: Trigger =
    row?.trigger ?? chosenTrigger ?? def.recommendedTrigger;
  const valueName = TRIGGERS[trigger].name;

  const personalCode = def.showPersonalCode
    ? compilePersonalCode(profile, lessonResponses)
    : null;

  // "I commit to" on its own isn't a commitment yet.
  const opener = def.inputPrefix?.trim() ?? "";
  const hasAnswer = text.trim().length > 0 && text.trim() !== opener;
  const showExamples =
    (def.examples?.length ?? 0) > 1 &&
    (text.trim() === "" || text.trim() === opener);

  async function logIt() {
    const entry = text.trim();
    if (submitting.current || !def || !hasAnswer) return;
    submitting.current = true;
    setPending(true);
    try {
      await store.logProof({
        trigger,
        action_text: entry.slice(0, PROOF_TEXT_MAX),
        action_category: "mission",
        mission_number: def.number,
        photo_url: photo,
        // Finishes a row declared under the old two-step flow.
        existingId: row && row.status !== "completed" ? row.id : null,
      });
      // The Personal Code compiles from these answers, so the same sentence
      // is written to the Mission's answer too — one input, two homes.
      if (PERSONAL_CODE_SLUGS.has(def.slug)) {
        await store.saveLessonResponse(def.slug, "q", entry);
        if (def.prefillIdentity) {
          await store.updateProfile({ identity_statement: entry });
        }
      }
      track("mission_action_completed", {
        missionNumber: def.number,
        selectedTrigger: trigger,
        timeSinceMissionOpened: Date.now() - openedAt.current,
      });
      if (photo) track("proof_photo_added", { missionNumber: def.number });
      const after = computeStats(missions ?? []).missionsCompleted + 1;
      if (after >= MISSION_COUNT) track("mission_30_completed");
      setJustLogged(true);
    } catch {
      showToast("Couldn't log that. Please try again.", {
        retry: () => void logIt(),
      });
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  /* ---------- just logged ---------- */

  if (justLogged) {
    const completedCount = computeStats(missions).missionsCompleted;
    const allDone = completedCount >= MISSION_COUNT;
    const next = nextMissionNumber(missions);
    return (
      <main className="fade-in flex flex-1 flex-col pt-10">
        <Headline className="text-center">
          {allDone ? "30-DAY MISSION COMPLETE" : "MISSION COMPLETE."}
        </Headline>
        <p className="font-display text-gold-gradient mt-4 text-center text-[24px] leading-snug">
          You acted with {TRIGGERS[trigger].provedWith}.
        </p>
        <p className="mt-6 text-center text-[17px] text-ink-1">
          {allDone
            ? "30 Missions. 30 proofs. Keep going."
            : "It's in your Proof Log."}
        </p>
        <div className="mt-10">
          {allDone ? (
            <Button onClick={() => router.push("/personal-code")}>
              VIEW MY PERSONAL CODE
            </Button>
          ) : (
            <Button
              onClick={() => router.push(next ? `/missions/${next}` : "/missions")}
            >
              CONTINUE TO THE NEXT MISSION
            </Button>
          )}
        </div>
      </main>
    );
  }

  const header = (
    <div className="flex items-center justify-between">
      <NavAction kind="back" href="/missions" />
      <span className="eyebrow text-ink-2">
        MISSION {def.number} OF {MISSION_COUNT}
      </span>
      <span className={done ? "eyebrow text-[var(--success)]" : "eyebrow text-ink-2"}>
        {done ? "COMPLETE" : "NOT STARTED"}
      </span>
    </div>
  );

  /* ---------- completed ---------- */

  if (done && row) {
    const next = nextMissionNumber(missions);
    return (
      <main className="pt-2 pb-8">
        {header}
        <Eyebrow tone="gold" className="mt-6">
          MISSION {def.number}
        </Eyebrow>
        <Headline level={2} className="mt-2">
          {def.title}
        </Headline>

        <GlassCard key={row.id} className="mt-6 border-[rgba(201,166,72,.35)]">
          <div className="flex items-center gap-2">
            <Check aria-hidden size={18} className="text-gold-300" />
            <Eyebrow tone="gold">
              {valueName}
              {row.completed_at ? ` · ${formatDate(row.completed_at)}` : ""}
            </Eyebrow>
          </div>
          <p className="mt-3 text-[19px] leading-relaxed whitespace-pre-wrap text-ink-0">
            {row.reflection ?? row.action_text}
          </p>
          {row.photo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={row.photo_url}
              alt="Your proof photo"
              className="mt-4 w-full rounded-[14px]"
            />
          )}
        </GlassCard>

        {next && (
          <div className="mt-6">
            <Button onClick={() => router.push(`/missions/${next}`)}>
              CONTINUE TO THE NEXT MISSION
            </Button>
          </div>
        )}
      </main>
    );
  }

  /* ---------- not started: the S.T.A.R. System, in order ---------- */

  return (
    <main className="pt-2 pb-8">
      {header}

      <Eyebrow tone="gold" className="mt-6">
        MISSION {def.number}
      </Eyebrow>
      <Headline level={2} className="mt-2">
        {def.title}
      </Headline>

      {/* Why it matters — on its own, before any instruction. */}
      <p className="mt-4 text-[19px] leading-snug text-ink-0">{def.statement}</p>

      {/* The reminder replaces the "spray your Scent Trigger, take a
          breath…" lines that used to be written into every Mission. */}
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

      <div className="mt-6 border-t border-[var(--line)]" />

      <StarStep letter="S" name="Select">
        <p className="text-[15px] text-ink-1">Select your Scent Trigger.</p>
        <FragranceCue
          label={null}
          value={trigger}
          recommended={def.recommendedTrigger}
          onChange={setChosenTrigger}
          className="mt-3"
        />
      </StarStep>

      <StarStep letter="T" name="Trigger">
        <p className="text-[17px] text-ink-0">Spray your selected fragrance.</p>
      </StarStep>

      <StarStep letter="A" name="Act">
        <p className="text-[17px] leading-snug text-ink-0">{def.action}</p>
        <p className="mt-2 text-[14px] text-ink-2">
          Takes less than 60 seconds.
        </p>
        {personalCode && (
          <GlassCard className="mt-4">
            <Eyebrow tone="gold">MY PERSONAL CODE</Eyebrow>
            <dl className="mt-4 space-y-3">
              {personalCode.map((line) => (
                <div key={line.key}>
                  <dt className="text-[13px] text-ink-2">{line.label}</dt>
                  <dd className="mt-0.5 text-[15px] leading-snug text-ink-0">
                    {line.value ?? (
                      <span className="text-ink-2">
                        Not written yet ({line.source}).
                      </span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </GlassCard>
        )}
        {def.youtubeId && (
          <MissionVideo
            youtubeId={def.youtubeId}
            title={def.title}
            missionNumber={def.number}
          />
        )}
      </StarStep>

      <StarStep letter="R" name="Record" last>
        <p className="text-[17px] leading-snug text-ink-0">{def.inputLabel}</p>

        {showExamples && def.examples && (
          <ExampleChips
            className="mt-3"
            examples={def.examples}
            onUse={(value) => {
              setText(value);
              track("mission_example_used", { missionNumber: def?.number });
            }}
          />
        )}

        <div className="mt-3">
          <Field
            variant="prominent"
            aria-label={def.inputLabel}
            value={text}
            onChange={setText}
            maxLength={PROOF_TEXT_MAX}
            multiline
            rows={4}
            placeholder="Write it here."
          />
        </div>

        {def.photoEncouraged && (
          <div className="mt-4">
            <PhotoInput value={photo} onChange={setPhoto} />
          </div>
        )}

        {/* The page's one primary action spans the full width, out from
            under the step indent, so it never wraps. */}
        <div className="mt-4 -ml-12">
          <Button
            loading={pending}
            disabled={!hasAnswer}
            onClick={() => void logIt()}
          >
            RECORD · COMPLETE MISSION {def.number}
          </Button>
        </div>
      </StarStep>

      <Sheet
        open={starOpen}
        title="THE S.T.A.R. SYSTEM"
        onClose={() => setStarOpen(false)}
      >
        <StarSystem />
        <Button variant="secondary" onClick={() => setStarOpen(false)}>
          GOT IT
        </Button>
      </Sheet>
    </main>
  );
}

/**
 * One step of S.T.A.R. on the Mission screen: the letter, the step's name,
 * and what belongs to it. A hairline runs down from each letter to the next
 * so the four read as one sequence rather than four boxes.
 */
function StarStep({
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
  return (
    <section className="relative mt-7 pl-12">
      <span
        aria-hidden
        className="font-display text-gold-gradient absolute top-0 left-0 w-8 text-center text-[30px] leading-none"
      >
        {letter}
      </span>
      {!last && (
        <span
          aria-hidden
          className="absolute top-10 -bottom-5 left-4 w-px bg-[var(--line)]"
        />
      )}
      <p className="eyebrow pt-1.5 text-gold-300">{name.toUpperCase()}</p>
      <div className="mt-2">{children}</div>
    </section>
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
