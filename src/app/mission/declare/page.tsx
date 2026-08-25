"use client";

import { PenLine } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import NavAction from "@/components/NavAction";
import BottomActions from "@/components/ui/BottomActions";
import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import Field from "@/components/ui/Field";
import Headline from "@/components/ui/Headline";
import { suggestionsFor } from "@/content/actionSuggestions";
import { TRIGGERS } from "@/content/triggers";
import type { Trigger } from "@/lib/data/types";
import { cn, readDraft, writeDraft } from "@/lib/utils";

const CUSTOM = "custom";

function isTrigger(value: string | null): value is Trigger {
  return value === "honor" || value === "courage" || value === "commitment";
}

function DeclareInner() {
  const router = useRouter();
  const params = useSearchParams();
  const trigger = params.get("trigger");

  const [selected, setSelected] = useState<string | null>(null);
  const [customText, setCustomText] = useState("");

  useEffect(() => {
    if (!isTrigger(trigger)) {
      router.replace("/home");
      return;
    }
    // Restore a draft when coming back from the trigger screen.
    const draft = readDraft();
    if (!draft || draft.trigger !== trigger) return;
    const match = suggestionsFor(trigger).find(
      (suggestion) => suggestion.text === draft.action_text,
    );
    // Reading the saved draft out of sessionStorage on mount is exactly the
    // "sync with an external system" case; there is nothing to await first.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (match) {
      setSelected(match.id);
    } else {
      setSelected(CUSTOM);
      setCustomText(draft.action_text);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
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

  function onContinue() {
    if (!isTrigger(trigger) || !ready || selected === null) return;
    const suggestion = suggestions.find((item) => item.id === selected);

    let action_text = trimmedCustom;
    let action_category = CUSTOM;
    if (suggestion) {
      action_text = suggestion.text;
      action_category = suggestion.id;
    }

    writeDraft({ trigger, action_text, action_category });
    router.push("/mission/trigger");
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
        {/* Your own words first — the suggestions are the fallback, not the
            default. */}
        <button
          type="button"
          role="radio"
          aria-checked={selected === CUSTOM}
          onClick={() => setSelected(CUSTOM)}
          className={cn(
            "glass flex w-full items-center gap-3 rounded-[14px] px-4 py-4 text-left transition-colors",
            selected === CUSTOM
              ? "border-[var(--gold-500)]"
              : "border-[rgba(201,166,72,.38)]",
          )}
        >
          <PenLine
            aria-hidden
            size={20}
            className="shrink-0 text-gold-300"
          />
          <span className="min-w-0 flex-1">
            <span className="font-display block text-[18px] leading-none text-ink-0">
              WRITE MY OWN ACTION
            </span>
            <span className="mt-1.5 block text-[13px] text-ink-2">
              Tap to declare your own action
            </span>
          </span>
        </button>

        {selected === CUSTOM && (
          <div className="mt-3">
            <Field
              value={customText}
              onChange={setCustomText}
              placeholder="One action. Short. Specific."
              maxLength={140}
              autoFocus
              aria-label="Your action"
            />
          </div>
        )}

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
        <Button disabled={!ready} onClick={onContinue}>
          CONTINUE
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
