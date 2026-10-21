"use client";

import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense, use, useEffect, useRef, useState } from "react";
import NavAction from "@/components/NavAction";
import FragranceCue from "@/components/FragranceCue";
import MissionVideo from "@/components/MissionVideo";
import PhotoInput from "@/components/PhotoInput";
import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import Field from "@/components/ui/Field";
import GlassCard from "@/components/ui/GlassCard";
import Headline from "@/components/ui/Headline";
import Spinner from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { PERSONAL_CODE_SLUGS, getMissionDef } from "@/content/missions";
import { TRIGGERS } from "@/content/triggers";
import { track } from "@/lib/analytics";
import { store, useAppData } from "@/lib/data/store";
import { compilePersonalCode } from "@/lib/personalCode";
import { PROOF_TEXT_MAX } from "@/lib/data/types";
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
 * One input, one click: why it matters, the recommended fragrance, one field,
 * one button. Submitting completes the Mission and writes the Proof. There is
 * no declare step, no in-progress state and no separate record screen — if a
 * man commits to a two-minute action, he does it.
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
  const [photo, setPhoto] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [justLogged, setJustLogged] = useState(false);
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

  // Mission 13 opens with the identity statement already in the field.
  useEffect(() => {
    if (seeded.current || !def || !profile) return;
    seeded.current = true;
    if (def.prefillIdentity && profile.identity_statement) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setText(profile.identity_statement);
    }
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
  const trigger = def.recommendedTrigger;
  const valueName = TRIGGERS[trigger].name;

  const personalCode = def.showPersonalCode
    ? compilePersonalCode(profile, lessonResponses)
    : null;

  async function logIt() {
    const entry = text.trim();
    if (submitting.current || !def || !entry) return;
    submitting.current = true;
    setPending(true);
    try {
      await store.logProof({
        trigger: def.recommendedTrigger,
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
        selectedTrigger: def.recommendedTrigger,
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
            ? "Thirty real actions. Thirty pieces of evidence. Keep using Honor, Courage and Commitment whenever you need them."
            : "That's evidence of the man you're becoming. It's in your Proof Log."}
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

  /* ---------- not started: one field, one button ---------- */

  return (
    <main className="pt-2 pb-8">
      {header}

      <Eyebrow tone="gold" className="mt-6">
        MISSION {def.number}
      </Eyebrow>
      <Headline level={2} className="mt-2">
        {def.title}
      </Headline>

      <p className="mt-4 text-[17px] leading-relaxed text-ink-1">{def.idea}</p>

      {def.youtubeId && (
        <MissionVideo
          youtubeId={def.youtubeId}
          title={def.title}
          missionNumber={def.number}
        />
      )}

      <FragranceCue trigger={trigger} className="mt-7" />

      {personalCode && (
        <GlassCard className="mt-5">
          <Eyebrow tone="gold">MY PERSONAL CODE</Eyebrow>
          <dl className="mt-4 space-y-3">
            {personalCode.map((line) => (
              <div key={line.key}>
                <dt className="text-[13px] text-ink-2">{line.label}</dt>
                <dd className="mt-0.5 text-[15px] leading-snug text-ink-0">
                  {line.value ?? (
                    <span className="text-ink-2">Not written yet — {line.source}.</span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </GlassCard>
      )}

      {/* The one thing the screen is for. Room to write more than a line,
          and lit like the button it leads to. */}
      <div className="mt-7">
        <Field
          variant="prominent"
          label={def.inputLabel}
          value={text}
          onChange={setText}
          maxLength={PROOF_TEXT_MAX}
          multiline
          rows={5}
          placeholder={def.inputPlaceholder}
        />
      </div>

      {def.photoEncouraged && (
        <div className="mt-4">
          <PhotoInput value={photo} onChange={setPhoto} />
        </div>
      )}

      {/* Tight to the field: the counter row below it already gives air. */}
      <div className="mt-4">
        <Button
          loading={pending}
          disabled={!text.trim()}
          onClick={() => void logIt()}
        >
          COMPLETE MISSION {def.number}
        </Button>
      </div>
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
