import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Primary actions pinned to the bottom of a full-page flow. Content scrolls
 * under it on short screens; the CTA is always reachable without scrolling.
 */
export default function BottomActions({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-20 -mx-5 mt-auto space-y-3 px-5 pt-6 pb-[calc(env(safe-area-inset-bottom)+16px)]",
        className,
      )}
      style={{
        background:
          "linear-gradient(180deg, rgba(7,9,13,0) 0%, rgba(7,9,13,.94) 24px, var(--bg-0) 100%)",
      }}
    >
      {children}
    </div>
  );
}
