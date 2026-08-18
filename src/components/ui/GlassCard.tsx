import type { CSSProperties, ReactNode } from "react";
import { TRIGGER_ACCENTS } from "@/content/triggers";
import type { Trigger } from "@/lib/data/types";
import { cn } from "@/lib/utils";

export default function GlassCard({
  accent,
  className,
  style,
  children,
}: {
  accent?: Trigger;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const tone = accent ? TRIGGER_ACCENTS[accent] : null;

  return (
    <div
      className={cn("glass relative overflow-hidden rounded-[20px] p-5", className)}
      style={
        tone
          ? {
              boxShadow: `inset 0 1px 0 rgba(255,255,255,.06), 0 10px 30px rgba(0,0,0,.35), 0 0 34px ${tone.glow}`,
              ...style,
            }
          : style
      }
    >
      {tone && (
        <span
          aria-hidden
          className="absolute top-0 bottom-0 left-0 w-[2px]"
          style={{
            background: tone.goldTrim
              ? "linear-gradient(180deg,#8F6E1E,#D4AF37,#E8D28A)"
              : tone.color,
          }}
        />
      )}
      {children}
    </div>
  );
}
