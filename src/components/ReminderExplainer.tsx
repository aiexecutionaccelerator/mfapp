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
        One notification, at the time you choose: &quot;One Mission. Two
        minutes. Do it and write it down.&quot; Nothing else — no marketing,
        no streaks, no nagging if you miss a day.
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
