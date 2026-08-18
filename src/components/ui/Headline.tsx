import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export default function Headline({
  level = 1,
  className,
  children,
}: {
  level?: 1 | 2;
  className?: string;
  children: ReactNode;
}) {
  const classes = cn(
    "font-display uppercase text-ink-0",
    level === 1 ? "text-[40px] leading-[1.05]" : "text-[30px] leading-[1.1]",
    className,
  );

  if (level === 2) return <h2 className={classes}>{children}</h2>;
  return <h1 className={classes}>{children}</h1>;
}
