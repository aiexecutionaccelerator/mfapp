"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useRef, useState } from "react";
import NavAction from "@/components/NavAction";
import Button from "@/components/ui/Button";
import Eyebrow, { AccentDot } from "@/components/ui/Eyebrow";
import Field from "@/components/ui/Field";
import Headline from "@/components/ui/Headline";
import { useToast } from "@/components/ui/Toast";
import { TRIGGERS, TRIGGER_ORDER } from "@/content/triggers";
import { track } from "@/lib/analytics";
import { store } from "@/lib/data/store";
import { PROOF_TEXT_MAX, type Trigger } from "@/lib/data/types";
import { cn } from "@/lib/utils";

function isTrigger(value: string | null): value is Trigger {
  return value === "honor" || value === "courage" || value === "commitment";
}

/**
 * A one-off Action — outside the thirty Missions, same shape as a Mission:
 * choose the value, write the one line, one button, done. It logs a Proof and
 * never counts toward the 30/30.
 */
function DeclareInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { showToast } = useToast();

  const initial = params.get("trigger");
  const [trigger, setTrigger] = useState<Trigger>(
    isTrigger(initial) ? initial : "honor",
  );
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const [logged, setLogged] = useState(false);
  const submitting = useRef(false);

  const meta = TRIGGERS[trigger];

  async function logIt() {
    const entry = text.trim();
    if (submitting.current || !entry) return;
    submitting.current = true;
    setPending(true);
    try {
      await store.logProof({
        trigger,
        action_text: entry.slice(0, PROOF_TEXT_MAX),
        action_category: "one-off",
      });
      track("freeform_mission_completed", { selectedTrigger: trigger });
      setLogged(true);
    } catch {
      showToast("Couldn't log that. Please try again.", {
        retry: () => void logIt(),
      });
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  if (logged) {
    return (
      <main className="fade-in flex flex-1 flex-col pt-10">
        <Headline className="text-center">PROOF LOGGED.</Headline>
        <p className="font-display text-gold-gradient mt-4 text-center text-[24px] leading-snug">
          You acted with {meta.provedWith}.
        </p>
        <div className="mt-10">
          <Button onClick={() => router.replace("/missions")}>DONE</Button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col pt-2">
      <div className="flex justify-end">
        <NavAction kind="close" href="/missions" />
      </div>

      <Headline className="mt-4">A ONE-OFF ACTION</Headline>
      <p className="mt-4 text-[15px] leading-relaxed text-ink-1">
        Something outside the thirty. Pick the value you need right now, spray
        it, take the action, and write it down — it lands in your Proof Log
        with everything else.
      </p>

      <Eyebrow tone="gold" className="mt-7">
        WHICH VALUE?
      </Eyebrow>
      <div className="mt-3 flex gap-2" role="radiogroup" aria-label="Which value?">
        {TRIGGER_ORDER.map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={trigger === value}
            onClick={() => setTrigger(value)}
            className={cn(
              "glass flex min-h-12 flex-1 items-center justify-center gap-2 rounded-[14px] px-2 text-[13px] tracking-[0.04em] uppercase",
              trigger === value
                ? "border-[var(--gold-500)] text-ink-0"
                : "text-ink-2",
            )}
          >
            <AccentDot trigger={value} />
            {TRIGGERS[value].name}
          </button>
        ))}
      </div>

      <div className="mt-7">
        <Field
          variant="prominent"
          label="What did you do?"
          value={text}
          onChange={setText}
          maxLength={PROOF_TEXT_MAX}
          multiline
          rows={4}
          placeholder="One action. Short. Specific."
        />
      </div>

      <div className="mt-4">
        <Button
          loading={pending}
          disabled={!text.trim()}
          onClick={() => void logIt()}
        >
          LOG THIS ACTION
        </Button>
      </div>
    </main>
  );
}

export default function DeclarePage() {
  return (
    <Suspense fallback={null}>
      <DeclareInner />
    </Suspense>
  );
}
