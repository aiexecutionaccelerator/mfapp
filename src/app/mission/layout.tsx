import type { ReactNode } from "react";

/** Focused Mission flow — no tab bar. Screens own their own bottom padding. */
export default function MissionLayout({ children }: { children: ReactNode }) {
  return <div className="flex flex-1 flex-col">{children}</div>;
}
