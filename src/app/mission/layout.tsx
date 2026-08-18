import type { ReactNode } from "react";

/** Focused Mission flow — no tab bar. */
export default function MissionLayout({ children }: { children: ReactNode }) {
  return <div className="pb-10">{children}</div>;
}
