"use client";

import { Check } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "@/components/ui/Toast";
import type { LessonPrompt } from "@/content/course";
import { store } from "@/lib/data/store";
import { LESSON_ANSWER_MAX } from "@/lib/data/types";
import { cn } from "@/lib/utils";

const DEBOUNCE_MS = 800;

/**
 * One lesson prompt. Text answers autosave on a pause and again on blur;
 * commitments and check-offs save on tap. Answers are private — they are never
 * shown anywhere but here and the Vivid Vision page, and never logged.
 */
export default function PromptField({
  lessonId,
  prompt,
  saved,
  labelClassName,
}: {
  lessonId: string;
  prompt: LessonPrompt;
  /** The stored answer, or null. */
  saved: string | null;
  labelClassName?: string;
}) {
  const { showToast } = useToast();
  const [value, setValue] = useState(saved ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaved = useRef(saved ?? "");
  // Lets the failure toast retry the same save without `save` referencing itself.
  const saveRef = useRef<((next: string) => Promise<void>) | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const save = useCallback(
    async (next: string) => {
      if (next === lastSaved.current) return;
      setStatus("saving");
      try {
        await store.saveLessonResponse(lessonId, prompt.id, next);
        lastSaved.current = next;
        setStatus("saved");
      } catch {
        setStatus("idle");
        showToast("Couldn't save that. It's still here — try again.", {
          retry: () => void saveRef.current?.(next),
        });
      }
    },
    [lessonId, prompt.id, showToast],
  );

  useEffect(() => {
    saveRef.current = save;
  }, [save]);

  function onChange(next: string) {
    setValue(next);
    setStatus("idle");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void save(next), DEBOUNCE_MS);
  }

  function onBlur() {
    if (timer.current) clearTimeout(timer.current);
    void save(value);
  }

  if (prompt.kind !== "text") {
    const checked = (saved ?? "") === "yes";
    return (
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => void save(checked ? "" : "yes")}
        className={cn(
          "glass flex w-full items-center gap-3 rounded-[14px] px-4 py-4 text-left transition-colors",
          checked && "border-[var(--gold-500)]",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] border",
            checked
              ? "bg-gold-gradient border-transparent"
              : "border-[var(--line-strong)]",
          )}
        >
          {checked && <Check size={16} className="text-[#07090D]" />}
        </span>
        <span
          className={cn(
            "min-w-0 flex-1 text-[17px] leading-snug",
            checked ? "text-ink-0" : "text-ink-1",
          )}
        >
          {prompt.label}
        </span>
      </button>
    );
  }

  return (
    <div>
      <label
        htmlFor={prompt.id}
        className={cn("block text-[15px] leading-snug text-ink-1", labelClassName)}
      >
        {prompt.label}
      </label>
      <textarea
        id={prompt.id}
        value={value}
        rows={5}
        maxLength={LESSON_ANSWER_MAX}
        placeholder={prompt.placeholder}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        className="mt-3 min-h-32 w-full resize-none rounded-[14px] border border-[var(--line)] bg-[rgba(18,23,34,.6)] px-4 py-3 text-[17px] leading-relaxed text-ink-0 outline-none transition-colors placeholder:text-ink-2 focus:border-[var(--gold-500)]"
      />
      <p className="mt-2 flex items-center justify-between text-[13px] text-ink-2">
        <span aria-live="polite">
          {status === "saved" ? "Saved" : status === "saving" ? "Saving…" : ""}
        </span>
        <span>
          {value.length}/{LESSON_ANSWER_MAX}
        </span>
      </p>
    </div>
  );
}
