"use client";

import { PenLine } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import NavAction from "@/components/NavAction";
import BottomActions from "@/components/ui/BottomActions";
import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import Field from "@/components/ui/Field";
import Headline from "@/components/ui/Headline";
import { useToast } from "@/components/ui/Toast";
import { suggestionsFor } from "@/content/actionSuggestions";
import { TRIGGERS } from "@/content/triggers";
import { track } from "@/lib/analytics";
import { store } from "@/lib/data/store";
import type { Trigger } from "@/lib/data/types";
import { cn } from "@/lib/utils";

const CUSTOM = "custom";

function isTrigger(value: string | null): value is Trigger {
  return value === "honor" || value === "courage" || value === "commitment";
}

function DeclareInner() {
  const router = useRouter();
  const params = useSearchParams();
  const trigger = params.get("trigger");

  const { showToast } = useToast();
  const [selected, setSelected] = useState<string | null>(null);
  const [customText, setCustomText] = useState("");
  const [pending, setPending] = useState(false);
  const starting = useRef(false);

  useEffect(() => {
    if (!isTrigger(trigger)) router.replace("/home");
  }, [trigger, router]);

  if (!isTrigger(trigger)) return null;

  const suggestions = suggestionsFor(trigger);
  const meta = TRIGGERS[trigger];
  const trimmedCustom = customText.trim();
  const ready =
    selected !== null && (selected !== CUSTOM || trimmedCustom.length >= 1);

  /** Choosing a suggestion abandons whatever was typed, and the reverse. */
  function chooseSuggestion(id: string) {
    setSelected(id);
    setCustomText("");
  }

  /** Typing your own action is itself the choice — no radio to tap first. */
  function writeCustom(next: string) {
    setCustomText(next);
    setSelected(next.trim() ? CUSTOM : null);
  }

  /**
   * Declaring creates the Action and goes straight to it. The spray-and-recall
   * ritual lives on that screen now — where a man actually sprays — instead of
   * behind one more tap.
   */
  async function declare() {
    if (starting.current || !isTrigger(trigger) || !ready || selected === null) {
      return;
    }
    const suggestion = suggestions.find((item) => item.id === selected);
    const action_text = suggestion ? suggestion.text : trimmedCustom;
    const action_category = suggestion ? suggestion.id : CUSTOM;

    starting.current = true;
    setPending(true);
    try {
      const mission = await store.createMission({
        trigger,
        action_text,
        action_category,
      });
      track("freeform_mission_started", { selectedTrigger: trigger });
      router.replace(`/action/active/${mission.id}`);
    } catch {
      starting.current = false;
      setPending(false);
      showToast(
        "Couldn't start your action. Check your connection and try again.",
        { retry: () => void declare() },
      );
    }
  }

  return (
    <main className="flex flex-1 flex-col pt-2">
      <div className="flex justify-end">
        <NavAction kind="close" href="/home" />
      </div>

      <Eyebrow accent={trigger} className="mt-4">
        {meta.name}
      </Eyebrow>
      <Headline className="mt-3">{meta.declareHeadline}</Headline>
      <p className="mt-4 text-[15px] leading-relaxed text-ink-1">{meta.about}</p>

      <div role="radiogroup" aria-label="Your action" className="mt-7">
        {/* Your own words first — the field itself, not a button that reveals
            one. Typing is the choice. */}
        <p className="flex items-center gap-2 text-[13px] text-ink-2">
          <PenLine aria-hidden size={16} className="shrink-0 text-gold-300" />
          Write your own action
        </p>
        <div className="mt-2">
          <Field
            value={customText}
            onChange={writeCustom}
            placeholder="One action. Short. Specific."
            maxLength={140}
            aria-label="Your action"
          />
        </div>

        <Eyebrow className="mt-7">OR CHOOSE ONE</Eyebrow>

        <div className="mt-3 space-y-3">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              type="button"
              role="radio"
              aria-checked={selected === suggestion.id}
              onClick={() => chooseSuggestion(suggestion.id)}
              className={cn(
                "glass block w-full rounded-[14px] px-4 py-4 text-left transition-colors",
                selected === suggestion.id && "border-[var(--gold-500)]",
              )}
            >
              <span
                className={cn(
                  "block text-[17px] leading-snug",
                  selected === suggestion.id ? "text-ink-0" : "text-ink-1",
                )}
              >
                {suggestion.text}
              </span>
              <span className="mt-1.5 block text-[13px] leading-snug text-ink-2">
                {suggestion.definition}
              </span>
            </button>
          ))}
        </div>
      </div>

      <BottomActions className="mt-8">
        <Button
          loading={pending}
          disabled={!ready}
          onClick={() => void declare()}
        >
          DECLARE MY ACTION
        </Button>
      </BottomActions>
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
