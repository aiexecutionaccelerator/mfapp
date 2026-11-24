"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useRef, useState } from "react";
import FragranceCue from "@/components/FragranceCue";
import { StarStep } from "@/components/mission/MissionForm";
import CompletionMedal from "@/components/motion/CompletionMedal";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import Headline from "@/components/ui/Headline";
import { useToast } from "@/components/ui/Toast";
import { TRIGGERS } from "@/content/triggers";
import { track } from "@/lib/analytics";
import { notRealWords } from "@/lib/curriculum";
import { store, useAppData } from "@/lib/data/store";
import { GainSummary } from "@/components/game/Level";
import { gainFrom } from "@/lib/game";
import { PROOF_TEXT_MAX, type Mission, type Trigger } from "@/lib/data/types";
import { cn } from "@/lib/utils";

/** What acting on each value can look like on an ordinary day. */
const ACT: Record<Trigger, string> = {
  honor: "Do one honorable thing: tell the truth, keep a promise, own a mistake. Or remember a time you acted with honor.",
  courage: "Do one thing that takes courage: speak up, move first, make the call. Or remember a time you acted with courage.",
  commitment: "Do one thing that shows commitment: show up, follow through, put in the reps. Or remember a time you kept going.",
};

/** Tap one to use it as is, or edit it into your own words. */
const STARTERS: Record<Trigger, string[]> = {
  honor: [
    "Told the truth even though it was awkward.",
    "Kept my word on something I said I'd do.",
    "Owned up to a mistake instead of making excuses.",
    "Gave someone the credit they deserved.",
    "Did the right thing when nobody was watching.",
  ],
  courage: [
    "Had a conversation I'd been putting off.",
    "Spoke up when I didn't agree.",
    "Asked for help instead of going it alone.",
    "Said no to something that wasn't right for me.",
    "Tried something new even though I was nervous.",
  ],
  commitment: [
    "Worked out even though I didn't feel like it.",
    "Followed through on something I started.",
    "Showed up for my family when I was tired.",
    "Stuck to my plan instead of taking the easy way out.",
    "Got the boring stuff done without putting it off.",
  ],
};

function isTrigger(value: string | null): value is Trigger {
  return value === "honor" || value === "courage" || value === "commitment";
}

/**
 * Activate (Antonio's Loom, 23 Nov; was "One-Off Action"): a day he wears the
 * fragrance outside the 30 Missions. The center tab. The same S.T.A.R. steps
 * as a Mission, asking what he did that's aligned with the value. It logs
 * proof and never counts toward the 30/30.
 */
function Activate() {
  const params = useSearchParams();
  const { showToast } = useToast();
  const initial = params.get("trigger");
  const [trigger, setTrigger] = useState<Trigger>(isTrigger(initial) ? initial : "courage");
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [logged, setLogged] = useState<Mission | null>(null);
  const { missions } = useAppData();
  const submitting = useRef(false);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const value = TRIGGERS[trigger].provedWith;

  function applyStarter(starter: string) {
    setText((current) => (current.trim() ? `${current.trimEnd()}\n${starter}` : starter));
    setError(null);
    requestAnimationFrame(() => {
      const el = textRef.current;
      if (!el) return;
      el.focus({ preventScroll: true });
      el.setSelectionRange(el.value.length, el.value.length);
    });
  }

  async function logIt() {
    const entry = text.trim();
    if (submitting.current) return;
    const problem = !entry ? "Write what you did first." : notRealWords(entry, { oneOff: true });
    if (problem) {
      setError(problem);
      return;
    }
    submitting.current = true;
    setPending(true);
    try {
      const saved = await store.logProof({
        trigger,
        action_text: entry.slice(0, PROOF_TEXT_MAX),
        action_category: "one-off",
      });
      track("freeform_mission_completed", { selectedTrigger: trigger });
      setLogged(saved);
      setText("");
      window.scrollTo({ top: 0 });
    } catch (e) {
      const message = e instanceof Error && e.message ? e.message : null;
      if (message && /words|sentence|more about/.test(message)) setError(message);
      else showToast("Couldn't log that. Please try again.", { retry: () => void logIt() });
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  if (logged) {
    return (
      <main className="fade-in flex flex-1 flex-col pt-10 text-center">
        <CompletionMedal quiet />
        <Headline className="mt-8">PROOF LOGGED.</Headline>
        <p className="font-display gold-shimmer mt-4 text-[26px] leading-snug">
          You acted with {TRIGGERS[logged.trigger].provedWith}.
        </p>
        {missions && <GainSummary gain={gainFrom(missions, logged)} />}
        <p className="mt-5 text-[17px] text-ink-1">It&apos;s in your Proof Log. It doesn&apos;t count toward the 30.</p>
        <div className="mt-10 space-y-2">
          <Button onClick={() => setLogged(null)}>LOG ANOTHER</Button>
          <Link href="/log" className="block">
            <Button variant="ghost">OPEN MY PROOF LOG</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col pt-6">
      <Headline>ACTIVATE</Headline>
      <p className="mt-3 text-[19px] leading-snug text-ink-0">
        Wearing the fragrance today? Log what you did with it.
      </p>

      <StarStep letter="S" name="Select" detail="your Scent Trigger">
        <FragranceCue label={null} value={trigger} onChange={(t) => { setTrigger(t); setError(null); }} />
        <p key={trigger} aria-live="polite" className="fade-in mt-3 text-[15px] leading-snug text-ink-1">
          {TRIGGERS[trigger].definition}
        </p>
      </StarStep>

      <StarStep letter="T" name="Trigger">
        <p className="text-[17px] text-ink-0">Spray {value}.</p>
      </StarStep>

      <StarStep letter="A" name="Act">
        <p className="text-[17px] leading-snug text-ink-0">{ACT[trigger]}</p>
      </StarStep>

      <StarStep letter="R" name="Record" last>
        <p id="activate-prompt" className="text-[17px] leading-snug text-ink-0">
          What did you do that&apos;s aligned with {value.toLowerCase()}?
        </p>
        <div role="group" aria-label="Start with" className="mt-3 flex flex-wrap gap-2">
          {STARTERS[trigger].map((starter) => (
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
          aria-label={`What did you do that's aligned with ${value.toLowerCase()}?`}
          value={text}
          onChange={(next) => {
            setText(next);
            setError(null);
          }}
          textareaRef={textRef}
          autoComplete="off"
          maxLength={PROOF_TEXT_MAX}
          multiline
          rows={4}
          placeholder="Pick one above, or write your own."
          aria-describedby={error ? "activate-error" : undefined}
        />
        <p
          id="activate-error"
          role="alert"
          className={cn("mt-4 text-[15px] leading-snug text-[var(--danger)]", !error && "sr-only")}
        >
          {error}
        </p>
        <div className="mt-4 -ml-12">
          <p className="mb-2 text-center text-[14px] text-ink-2">
            Logging with <span className="font-semibold text-ink-0">{value}</span>
          </p>
          <Button loading={pending} onClick={() => void logIt()}>
            LOG THIS ACTION
          </Button>
        </div>
      </StarStep>
    </main>
  );
}

export default function ActivatePage() {
  return (
    <Suspense fallback={null}>
      <Activate />
    </Suspense>
  );
}
