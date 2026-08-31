"use client";

import Button from "@/components/ui/Button";

/** Sheet title for the explainer — the only screen that asks for permission. */
export const REMINDER_EXPLAINER_TITLE = "REMINDERS";

/**
 * The one-screen reason we show before the browser's permission prompt.
 * Used by the Mission Active reminder sheet and the Settings toggle.
 */
export default function ReminderExplainer({
  loading = false,
  onAllow,
  onNotNow,
}: {
  loading?: boolean;
  onAllow: () => void;
  onNotNow: () => void;
}) {
  return (
    <>
      <p className="text-[15px] text-ink-1">
        We&apos;ll send one notification at the time you choose: &quot;Your
        action is waiting. Did you do it?&quot; Nothing else — no marketing, no
        streaks.
      </p>
      <Button loading={loading} onClick={onAllow}>
        ALLOW NOTIFICATIONS
      </Button>
      <Button variant="ghost" onClick={onNotNow}>
        Not now
      </Button>
    </>
  );
}
