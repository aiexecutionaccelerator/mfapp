"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useRef, useState } from "react";
import FragranceCue from "@/components/FragranceCue";
import NavAction from "@/components/NavAction";
import TapToUse from "@/components/TapToUse";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import Headline from "@/components/ui/Headline";
import { useToast } from "@/components/ui/Toast";
import { TRIGGERS } from "@/content/triggers";
import { track } from "@/lib/analytics";
import { store } from "@/lib/data/store";
import { PROOF_TEXT_MAX, type Trigger } from "@/lib/data/types";

/** One plain example per value, in the voice of a man typing fast. */
const ONE_OFF_EXAMPLES: Record<Trigger, string> = {
  honor: "Owned up to my mistake.",
  courage: "Made the call I'd been dodging.",
  commitment: "Did the workout anyway.",
};

function isTrigger(value: string | null): value is Trigger {
  return value === "honor" || value === "courage" || value === "commitment";
}

/**
 * A one-off Action — outside the thirty Missions, same shape as a Mission:
 * select the Scent Trigger, write the one line, one button, done. It logs a Proof and
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
        Not part of the 30. Select your Scent Trigger, spray, act, log it.
      </p>

      <FragranceCue
        value={trigger}
        onChange={setTrigger}
        className="mt-7"
      />

      <p className="eyebrow mt-7 text-gold-300">WHAT DID YOU DO?</p>

      {/* The example follows the Scent Trigger he picked — a Courage example
          is no use to a man reaching for Commitment. */}
      {!text.trim() && (
        <TapToUse
          className="mt-2"
          text={ONE_OFF_EXAMPLES[trigger]}
          onUse={setText}
        />
      )}

      <div className="mt-3">
        <Field
          variant="prominent"
          aria-label="What did you do?"
          value={text}
          onChange={setText}
          maxLength={PROOF_TEXT_MAX}
          multiline
          rows={4}
          placeholder="Write it here."
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
