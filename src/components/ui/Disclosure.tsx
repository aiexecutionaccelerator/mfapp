"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A labelled section that opens on tap. Closed by default: the options and
 * examples on a Mission are help, not part of the task. Opening one never
 * changes anything else on the screen.
 */
export default function Disclosure({
  label,
  helper,
  children,
  className,
  onOpen,
}: {
  label: string;
  helper?: string;
  children: ReactNode;
  className?: string;
  onOpen?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className={cn("rounded-[14px] border border-[var(--line)]", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => {
          if (!open) onOpen?.();
          setOpen(!open);
        }}
        className="flex min-h-12 w-full items-center justify-between gap-3 px-4 text-left text-[15px] text-gold-300"
      >
        {label}
        <ChevronDown
          aria-hidden
          size={18}
          className={cn("shrink-0 transition-transform duration-200", open && "rotate-180")}
        />
      </button>
      {/* Height animates open (grid-rows); closed content is inert so it
          can't be tabbed into or read out while hidden. */}
      <div
        id={id}
        className="disclosure-body"
        data-open={open}
        inert={!open}
        aria-hidden={!open}
      >
        <div>
          <div className="px-4 pb-4">
            {helper && <p className="text-[13px] leading-snug text-ink-2">{helper}</p>}
            <div className={helper ? "mt-3" : undefined}>{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
