import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export default function Pill({
  active = false,
  className,
  children,
}: {
  active?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "eyebrow inline-flex items-center gap-1.5 rounded-full px-3 py-1.5",
        active
          ? "border border-[var(--gold-500)] text-gold-300"
          : "glass text-ink-1",
        className,
      )}
    >
      {children}
    </span>
  );
}
