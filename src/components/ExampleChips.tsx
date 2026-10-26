import { CornerDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A few answers a man can take, or ignore and write his own. One tap drops
 * the sentence into the field; the whole set disappears once he has started
 * writing, so the screen gets simpler as he commits.
 *
 * Several, not one: people put in their own stuff, so the examples are there
 * to show the shape of an answer, not to pick it for him.
 */
export default function ExampleChips({
  examples,
  onUse,
  className,
}: {
  examples: readonly string[];
  onUse: (text: string) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="eyebrow flex items-center gap-2 text-ink-2">
        <CornerDownLeft aria-hidden size={13} className="shrink-0" />
        TAP ONE, OR WRITE YOUR OWN
      </p>
      <div className="mt-2 space-y-2">
        {examples.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => onUse(example)}
            aria-label={`Use this example: ${example}`}
            className={cn(
              "tap-to-use block w-full rounded-[12px] px-4 py-2.5 text-left text-[15px] leading-snug text-ink-1",
            )}
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
