import { STAR_CLOSER, STAR_STEPS } from "@/content/triggers";
import { cn } from "@/lib/utils";

/**
 * The S.T.A.R. System as four separate cards — the layout Antonio asked to
 * keep, because he can see the four parts at a glance. Rendered from the one
 * shared definition wherever the system is taught, so it never says two
 * different things in two places.
 */
export default function StarSystem({
  className,
  closer = true,
}: {
  className?: string;
  /** The "a dozen times… 30 times" line under the cards. */
  closer?: boolean;
}) {
  return (
    <div className={className}>
      <div className="space-y-4">
        {STAR_STEPS.map((step) => (
          <div
            key={step.letter}
            className="glass flex items-start gap-5 rounded-[16px] px-5 py-5"
          >
            <span className="font-display text-gold-gradient w-9 shrink-0 pt-0.5 text-center text-[36px] leading-none">
              {step.letter}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[19px] text-ink-0">{step.name}</p>
              <p className="mt-1.5 text-[16px] leading-relaxed text-ink-1">
                {step.text}
              </p>
              {"example" in step && (
                <p className="mt-2 text-[13px] leading-snug text-ink-2 italic">
                  {step.example}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      {closer && (
        <p className={cn("mt-6 text-[16px] leading-relaxed text-ink-1")}>
          {STAR_CLOSER}
        </p>
      )}
    </div>
  );
}
