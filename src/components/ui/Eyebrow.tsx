import type { ReactNode } from "react";
import { TRIGGER_ACCENTS } from "@/content/triggers";
import type { Trigger } from "@/lib/data/types";
import { cn } from "@/lib/utils";

export function AccentDot({ trigger }: { trigger: Trigger }) {
  const tone = TRIGGER_ACCENTS[trigger];
  return (
    <span
      aria-hidden
      className="inline-block h-2 w-2 shrink-0 rounded-full"
      style={{
        background: tone.color,
        boxShadow: tone.edge ? `0 0 0 1px ${tone.edge}` : undefined,
      }}
    />
  );
}

export default function Eyebrow({
  accent,
  tone = "muted",
  className,
  children,
}: {
  accent?: Trigger;
  tone?: "muted" | "gold";
  className?: string;
  children: ReactNode;
}) {
  return (
    <p
      className={cn(
        "eyebrow flex items-center gap-2",
        tone === "gold" ? "text-gold-300" : "text-ink-2",
        className,
      )}
    >
      {accent && <AccentDot trigger={accent} />}
      <span>{children}</span>
    </p>
  );
}
