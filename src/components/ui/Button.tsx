"use client";

import type { ButtonHTMLAttributes } from "react";
import Spinner from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  full?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-gold-gradient text-[#07090D] shadow-[inset_0_1px_0_rgba(255,255,255,.35),0_8px_24px_rgba(201,166,72,.18)]",
  secondary: "glass text-ink-0 rounded-[14px]",
  ghost: "text-ink-1 hover:text-ink-0",
  danger: "border border-[var(--danger)] text-[var(--danger)]",
};

export default function Button({
  variant = "primary",
  loading = false,
  full = true,
  disabled,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[14px] px-5 text-center text-[15px] font-semibold tracking-[0.08em] transition-opacity duration-200",
        variant === "ghost" ? "min-h-12" : "min-h-14",
        full ? "w-full" : "w-auto",
        VARIANTS[variant],
        (disabled || loading) && "pointer-events-none opacity-45",
        className,
      )}
      {...rest}
    >
      {loading && <Spinner size={18} />}
      {children}
    </button>
  );
}
