"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

interface FieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  multiline?: boolean;
  rows?: number;
  /**
   * "prominent" is the Mission writing field: a tall glass surface with a
   * gold edge that blooms on focus. Everything else stays quiet.
   */
  variant?: "default" | "prominent";
  type?: string;
  inputMode?: "text" | "email" | "numeric";
  autoComplete?: string;
  autoFocus?: boolean;
  onBlur?: () => void;
  className?: string;
  inputClassName?: string;
  "aria-label"?: string;
}

export default function Field({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  multiline = false,
  rows = 4,
  variant = "default",
  type = "text",
  inputMode,
  autoComplete,
  autoFocus,
  onBlur,
  className,
  inputClassName,
  ...rest
}: FieldProps) {
  const id = useId();
  const prominent = variant === "prominent";

  const shared = cn(
    "w-full text-ink-0 outline-none",
    prominent
      ? "field-prominent rounded-[18px] px-5 py-4 text-[19px] leading-relaxed"
      : "rounded-[14px] border border-[var(--line)] bg-[rgba(18,23,34,.6)] px-4 py-3 text-[17px] transition-colors focus:border-[var(--gold-500)]",
    inputClassName,
  );

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label
          htmlFor={id}
          className={cn(
            "eyebrow mb-2 block",
            prominent ? "text-gold-300" : "text-ink-2",
          )}
        >
          {label}
        </label>
      )}
      {multiline ? (
        <textarea
          id={id}
          className={cn(
            shared,
            "resize-none",
            prominent ? "min-h-[168px]" : "min-h-28",
          )}
          value={value}
          rows={rows}
          placeholder={placeholder}
          maxLength={maxLength}
          autoFocus={autoFocus}
          onBlur={onBlur}
          onChange={(event) => onChange(event.target.value)}
          aria-label={rest["aria-label"] ?? label}
        />
      ) : (
        <input
          id={id}
          className={cn(shared, prominent ? "min-h-16" : "min-h-14")}
          value={value}
          type={type}
          inputMode={inputMode}
          autoComplete={autoComplete}
          placeholder={placeholder}
          maxLength={maxLength}
          autoFocus={autoFocus}
          onBlur={onBlur}
          onChange={(event) => onChange(event.target.value)}
          aria-label={rest["aria-label"] ?? label}
        />
      )}
      {maxLength !== undefined && (
        <p
          className={cn(
            "mt-2 text-right text-[13px] text-ink-2",
            // Quiet until it matters — a counter is not the point of the page.
            prominent && value.length < maxLength * 0.8 && "opacity-0",
          )}
          aria-hidden={prominent && value.length < maxLength * 0.8}
        >
          {value.length}/{maxLength}
        </p>
      )}
    </div>
  );
}
