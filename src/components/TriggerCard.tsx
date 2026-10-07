import { ChevronRight } from "lucide-react";
import Link from "next/link";
import BottleVisual from "@/components/BottleVisual";
import GlassCard from "@/components/ui/GlassCard";
import { TRIGGERS } from "@/content/triggers";
import type { Trigger } from "@/lib/data/types";
import { cn } from "@/lib/utils";

function Body({
  trigger,
  tappable,
  compact,
}: {
  trigger: Trigger;
  tappable: boolean;
  compact: boolean;
}) {
  const meta = TRIGGERS[trigger];
  return (
    <div
      className={cn(
        "flex items-center gap-4",
        compact ? "min-h-[56px]" : "min-h-[104px]",
      )}
    >
      <BottleVisual trigger={trigger} size={compact ? 34 : 56} />
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "font-display leading-none text-ink-0",
            compact ? "text-[20px]" : "text-[26px]",
          )}
        >
          {meta.name}
        </p>
        {!compact && (
          <p className="mt-2 text-[13px] text-ink-1">{meta.tagline}</p>
        )}
      </div>
      {tappable && (
        <ChevronRight
          aria-hidden
          className="shrink-0 text-ink-2"
          size={compact ? 18 : 22}
        />
      )}
    </div>
  );
}

/**
 * `compact` is the Start-screen form: the three values as a quiet row under
 * the one thing the screen is actually asking for.
 */
export default function TriggerCard({
  trigger,
  href,
  compact = false,
}: {
  trigger: Trigger;
  href?: string;
  compact?: boolean;
}) {
  const meta = TRIGGERS[trigger];

  if (!href) {
    return (
      <GlassCard accent={trigger} className={compact ? "px-4 py-3" : undefined}>
        <Body trigger={trigger} tappable={false} compact={compact} />
      </GlassCard>
    );
  }

  return (
    <Link
      href={href}
      aria-label={`Take a ${meta.name[0]}${meta.name.slice(1).toLowerCase()} Action`}
      className="block"
    >
      <GlassCard accent={trigger} className={compact ? "px-4 py-3" : undefined}>
        <Body trigger={trigger} tappable compact={compact} />
      </GlassCard>
    </Link>
  );
}
