"use client";

import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import NavAction from "@/components/NavAction";
import StoicQuoteBlock from "@/components/StoicQuoteBlock";
import ReminderExplainer, {
  REMINDER_EXPLAINER_TITLE,
} from "@/components/ReminderExplainer";
import BottomActions from "@/components/ui/BottomActions";
import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import Headline from "@/components/ui/Headline";
import Sheet from "@/components/ui/Sheet";
import { useToast } from "@/components/ui/Toast";
import { quoteForMission } from "@/content/stoicQuotes";
import { TRIGGERS } from "@/content/triggers";
import { store, useAppData } from "@/lib/data/store";
import { getPermission, subscribeToPush, usePushSupport } from "@/lib/push";
import { formatTime, relativeTime, writeReminder } from "@/lib/utils";

const IN_APP_TOAST = "We'll flag this Mission when you're back.";

const IOS_STEPS = [
  "1. Tap the Share button in Safari.",
  '2. Choose "Add to Home Screen".',
  "3. Open Mission Fragrances from your Home Screen and set the reminder again.",
];

/** Minutes from now, or the next 8 PM — falling back to 8 AM once it is late. */
function reminderOptions(): { label: string; at: Date }[] {
  const now = Date.now();
  const later = (minutes: number) => new Date(now + minutes * 60_000);

  const tonight = new Date(now);
  tonight.setHours(20, 0, 0, 0);
  let evening = { label: "Tonight (8 PM)", at: tonight };
  if (tonight.getTime() <= now) {
    const morning = new Date(now);
    morning.setDate(morning.getDate() + 1);
    morning.setHours(8, 0, 0, 0);
    evening = { label: "Tomorrow morning (8 AM)", at: morning };
  }

  return [
    { label: "30 minutes", at: later(30) },
    { label: "1 hour", at: later(60) },
    { label: "3 hours", at: later(180) },
    evening,
  ];
}

type SheetView = "options" | "explainer" | "ios";

export default function ActiveMissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { showToast } = useToast();

  const { missions, error } = useAppData();
  const found = missions?.find((m) => m.id === id) ?? null;
  const mission = found?.status === "active" ? found : null;

  const [sheetOpen, setSheetOpen] = useState(false);
  const [view, setView] = useState<SheetView>("options");
  const [pendingAt, setPendingAt] = useState<Date | null>(null);
  const [subscribing, setSubscribing] = useState(false);
  const support = usePushSupport();

  useEffect(() => {
    if (error) {
      router.replace("/home");
      return;
    }
    if (!missions) return;
    if (!found || found.status === "ended") {
      router.replace("/home");
      return;
    }
    if (found.status === "completed") {
      router.replace(`/mission/complete/${found.id}`);
    }
  }, [error, missions, found, router]);

  if (!mission) return null;

  function dismiss() {
    setSheetOpen(false);
    setPendingAt(null);
  }

  async function schedulePush(at: Date) {
    if (!mission) return;
    try {
      await store.scheduleReminder(mission.id, at);
      showToast(`Reminder set for ${formatTime(at.toISOString())}.`);
    } catch {
      showToast(IN_APP_TOAST);
    }
  }

  async function chooseReminder(at: Date) {
    if (!mission) return;
    // The in-app banner is the floor under every path, push or not.
    writeReminder({ missionId: mission.id, at: at.toISOString() });

    if (support === "ios-needs-install") {
      setView("ios");
      return;
    }
    if (support !== "supported") {
      dismiss();
      showToast(IN_APP_TOAST);
      return;
    }
    if (getPermission() === "granted") {
      dismiss();
      await schedulePush(at);
      return;
    }
    setPendingAt(at);
    setView("explainer");
  }

  async function allowNotifications() {
    const at = pendingAt;
    if (!at) return;
    setSubscribing(true);
    const result = await subscribeToPush();
    setSubscribing(false);
    dismiss();

    if (result === "granted") {
      await schedulePush(at);
      return;
    }
    if (result === "denied") {
      showToast(
        "Notifications are off for this site. We'll flag the Mission in-app instead.",
      );
      return;
    }
    showToast(IN_APP_TOAST);
  }

  function keepInAppOnly() {
    dismiss();
    showToast(IN_APP_TOAST);
  }

  const sheetTitle =
    view === "explainer"
      ? REMINDER_EXPLAINER_TITLE
      : view === "ios"
        ? "GET REMINDERS ON IPHONE"
        : "REMIND ME LATER";

  return (
    <main className="flex flex-1 flex-col pt-2">
      <div className="flex justify-end">
        <NavAction kind="close" href="/home" />
      </div>

      <div className="mt-10">
        <Eyebrow accent={mission.trigger}>
          {TRIGGERS[mission.trigger].name}
        </Eyebrow>
        <Headline className="mt-3">ACTION IN PROGRESS</Headline>
        <p className="font-display mt-6 text-[28px] leading-tight text-ink-0">
          {mission.action_text}
        </p>
        <p className="mt-6 text-[17px] text-ink-1">Phone down. Go do it.</p>
        <p className="mt-2 text-[13px] text-ink-2">
          Started {relativeTime(mission.started_at)}
        </p>
        <StoicQuoteBlock quote={quoteForMission(mission.trigger, mission.id)} />
      </div>

      <BottomActions className="pt-10">
        <Button onClick={() => router.push(`/mission/checkin/${mission.id}`)}>
          CHECK IN NOW
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            setView("options");
            setSheetOpen(true);
          }}
        >
          REMIND ME LATER
        </Button>
      </BottomActions>

      <Sheet
        open={sheetOpen}
        title={sheetTitle}
        note={
          view === "options" && support === "unsupported"
            ? "Reminders show inside the app on this browser."
            : undefined
        }
        onClose={dismiss}
      >
        {view === "explainer" ? (
          <ReminderExplainer
            loading={subscribing}
            onAllow={() => void allowNotifications()}
            onNotNow={keepInAppOnly}
          />
        ) : view === "ios" ? (
          <>
            <ul className="space-y-2 text-[15px] text-ink-1">
              {IOS_STEPS.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
            <p className="text-[13px] text-ink-2">
              iPhone only delivers notifications to installed web apps.
            </p>
            <Button onClick={keepInAppOnly}>GOT IT</Button>
          </>
        ) : (
          reminderOptions().map((option) => (
            <Button
              key={option.label}
              variant="secondary"
              onClick={() => void chooseReminder(option.at)}
            >
              {option.label}
            </Button>
          ))
        )}
      </Sheet>
    </main>
  );
}
