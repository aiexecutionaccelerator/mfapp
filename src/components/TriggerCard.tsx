import { ChevronRight } from "lucide-react";
import Link from "next/link";
import BottleVisual from "@/components/BottleVisual";
import GlassCard from "@/components/ui/GlassCard";
import { TRIGGERS } from "@/content/triggers";
import type { Trigger } from "@/lib/data/types";

function Body({ trigger, tappable }: { trigger: Trigger; tappable: boolean }) {
  const meta = TRIGGERS[trigger];
  return (
    <div className="flex min-h-[104px] items-center gap-4">
      <BottleVisual trigger={trigger} size={56} />
      <div className="min-w-0 flex-1">
        <p className="font-display text-[26px] leading-none text-ink-0">
          {meta.name}
        </p>
        <p className="mt-2 text-[13px] text-ink-1">{meta.tagline}</p>
      </div>
      {tappable && (
        <ChevronRight aria-hidden className="shrink-0 text-ink-2" size={22} />
      )}
    </div>
  );
}

export default function TriggerCard({
  trigger,
  href,
}: {
  trigger: Trigger;
  href?: string;
}) {
  const meta = TRIGGERS[trigger];

  if (!href) {
    return (
      <GlassCard accent={trigger}>
        <Body trigger={trigger} tappable={false} />
      </GlassCard>
    );
  }

  return (
    <Link
      href={href}
      aria-label={`Take a ${meta.name[0]}${meta.name.slice(1).toLowerCase()} Action`}
      className="block"
    >
      <GlassCard accent={trigger}>
        <Body trigger={trigger} tappable />
      </GlassCard>
    </Link>
  );
}
