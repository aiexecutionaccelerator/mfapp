import type { ReactNode } from "react";

/**
 * Remounts on every navigation inside the app, so each screen arrives with
 * the same short rise out of a blur (.page-enter). Layout (tab bar, buy row)
 * stays put; only the screen moves.
 */
export default function AppTemplate({ children }: { children: ReactNode }) {
  return <div className="page-enter flex flex-1 flex-col">{children}</div>;
}
