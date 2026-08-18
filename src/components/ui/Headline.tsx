import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** `level` picks the display size; `as` picks the tag (one h1 per screen). */
export default function Headline({
  level = 1,
  as: Tag = "h1",
  className,
  children,
}: {
  level?: 1 | 2;
  as?: "h1" | "h2";
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag
      className={cn(
        "font-display uppercase text-ink-0",
        level === 1 ? "text-[40px] leading-[1.05]" : "text-[30px] leading-[1.1]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
