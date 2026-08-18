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

  const shared = cn(
    "w-full rounded-[14px] border border-[var(--line)] bg-[rgba(18,23,34,.6)] px-4 py-3 text-[17px] text-ink-0 outline-none transition-colors focus:border-[var(--gold-500)]",
    inputClassName,
  );

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label htmlFor={id} className="eyebrow mb-2 block text-ink-2">
          {label}
        </label>
      )}
      {multiline ? (
        <textarea
          id={id}
          className={cn(shared, "min-h-28 resize-none")}
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
          className={cn(shared, "min-h-14")}
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
        <p className="mt-2 text-right text-[13px] text-ink-2">
          {value.length}/{maxLength}
        </p>
      )}
    </div>
  );
}
