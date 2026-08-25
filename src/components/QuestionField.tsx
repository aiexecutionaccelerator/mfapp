"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { store } from "@/lib/data/store";
import { LESSON_ANSWER_MAX } from "@/lib/data/types";
import { cn } from "@/lib/utils";

const DEBOUNCE_MS = 800;

/**
 * The one Mission question. Autosaves on a pause and again on blur. Answers
 * are private — never shown to anyone else and never logged. `slug` is the
 * Mission's answer key (`m8`); the prompt key is always `q`.
 */
export default function QuestionField({
  slug,
  label,
  placeholder,
  saved,
  initial,
  rows = 4,
  labelClassName,
  onSaved,
}: {
  slug: string;
  label: string;
  placeholder?: string;
  /** The stored answer, or null. */
  saved: string | null;
  /** Seed when nothing is stored yet (Mission 13's identity statement). */
  initial?: string | null;
  rows?: number;
  labelClassName?: string;
  onSaved?: (answer: string) => void;
}) {
  const { showToast } = useToast();
  const [value, setValue] = useState(saved ?? initial ?? "");
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
        await store.saveLessonResponse(slug, "q", next);
        lastSaved.current = next;
        setStatus("saved");
        onSaved?.(next);
      } catch {
        setStatus("idle");
        showToast("Couldn't save that. It's still here — try again.", {
          retry: () => void saveRef.current?.(next),
        });
      }
    },
    [slug, showToast, onSaved],
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

  return (
    <div>
      <label
        htmlFor={`question-${slug}`}
        className={cn("block text-[15px] leading-snug text-ink-1", labelClassName)}
      >
        {label}
      </label>
      <textarea
        id={`question-${slug}`}
        value={value}
        rows={rows}
        maxLength={LESSON_ANSWER_MAX}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        className="mt-3 min-h-28 w-full resize-none rounded-[14px] border border-[var(--line)] bg-[rgba(18,23,34,.6)] px-4 py-3 text-[17px] leading-relaxed text-ink-0 outline-none transition-colors placeholder:text-ink-2 focus:border-[var(--gold-500)]"
      />
      <p className="mt-1 text-right text-[13px] text-ink-2" aria-live="polite">
        {status === "saved" ? "Saved" : status === "saving" ? "Saving…" : " "}
      </p>
    </div>
  );
}
