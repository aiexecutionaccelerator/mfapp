import { CornerDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * An example a man can actually take. Grey text inside a field is a dead end
 * — he can read it but not keep it. This puts the same sentence on a button:
 * one tap drops it into the field, where he edits it into his own truth.
 *
 * It belongs under an empty field and disappears the moment there is
 * anything in it — a starting point, not a permanent fixture.
 */
export default function TapToUse({
  text,
  onUse,
  className,
}: {
  text: string;
  onUse: (text: string) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onUse(text)}
      aria-label={`Use this example: ${text}`}
      className={cn("tap-to-use block w-full rounded-[14px] px-4 py-3 text-left", className)}
    >
      <span className="eyebrow flex items-center gap-2 text-ink-2">
        <CornerDownLeft aria-hidden size={13} className="shrink-0" />
        EXAMPLE · TAP TO USE
      </span>
      <span className="mt-1.5 block text-[15px] leading-snug text-ink-1">
        {text}
      </span>
    </button>
  );
}
