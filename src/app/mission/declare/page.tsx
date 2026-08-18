"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import NavAction from "@/components/NavAction";
import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import Field from "@/components/ui/Field";
import Headline from "@/components/ui/Headline";
import { suggestionsFor } from "@/content/actionSuggestions";
import { TRIGGERS } from "@/content/triggers";
import type { Trigger } from "@/lib/data/types";
import { cn, readDraft, slugify, writeDraft } from "@/lib/utils";

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

  function onContinue() {
    if (!isTrigger(trigger) || !ready) return;
    const suggestion = suggestions.find((item) => item.id === selected);
    const actionText = suggestion ? suggestion.text : trimmedCustom;
    writeDraft({
      trigger,
      action_text: actionText,
      action_category: suggestion ? suggestion.category : slugify(actionText),
    });
    router.push("/mission/trigger");
  }

  return (
    <main className="flex min-h-dvh flex-col pt-[calc(env(safe-area-inset-top)+8px)]">
      <div className="flex justify-end">
        <NavAction kind="close" href="/home" />
      </div>

      <Eyebrow accent={trigger} className="mt-4">
        {meta.name}
      </Eyebrow>
      <Headline className="mt-3">{meta.declareHeadline}</Headline>

      <div role="radiogroup" className="mt-6 space-y-3">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.id}
            type="button"
            role="radio"
            aria-checked={selected === suggestion.id}
            onClick={() => setSelected(suggestion.id)}
            className={cn(
              "glass flex min-h-[56px] w-full items-center rounded-[14px] px-4 text-left text-[17px]",
              selected === suggestion.id
                ? "border-[var(--gold-500)] text-ink-0"
                : "text-ink-1",
            )}
          >
            {suggestion.text}
          </button>
        ))}
        <button
          type="button"
          role="radio"
          aria-checked={selected === CUSTOM}
          onClick={() => setSelected(CUSTOM)}
          className={cn(
            "glass flex min-h-[56px] w-full items-center rounded-[14px] px-4 text-left text-[17px]",
            selected === CUSTOM
              ? "border-[var(--gold-500)] text-ink-0"
              : "text-ink-1",
          )}
        >
          Custom
        </button>
      </div>

      {selected === CUSTOM && (
        <div className="mt-4">
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

      <div className="mt-8 pb-10">
        <Button disabled={!ready} onClick={onContinue}>
          CONTINUE
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
