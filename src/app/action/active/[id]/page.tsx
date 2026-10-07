"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, use, useEffect, useRef, useState } from "react";
import BottleVisual from "@/components/BottleVisual";
import NavAction from "@/components/NavAction";
import PhotoInput from "@/components/PhotoInput";
import StoicQuoteBlock from "@/components/StoicQuoteBlock";
import ReminderExplainer, {
  REMINDER_EXPLAINER_TITLE,
} from "@/components/ReminderExplainer";
import BottomActions from "@/components/ui/BottomActions";
import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import Field from "@/components/ui/Field";
import Headline from "@/components/ui/Headline";
import Sheet from "@/components/ui/Sheet";
import { useToast } from "@/components/ui/Toast";
import { quoteForMission } from "@/content/stoicQuotes";
import { TRIGGERS, TRIGGER_ACCENTS } from "@/content/triggers";
import { track } from "@/lib/analytics";
import { store, useAppData } from "@/lib/data/store";
import { PROOF_TEXT_MAX } from "@/lib/data/types";
import { getPermission, subscribeToPush, usePushSupport } from "@/lib/push";
import { clearReminderFor, formatTime, writeReminder } from "@/lib/utils";

const IN_APP_TOAST = "We'll flag this action when you're back.";

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

function ActiveActionInner({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const search = useSearchParams();
  const { showToast } = useToast();

  const { missions, error } = useAppData();
  const found = missions?.find((m) => m.id === id) ?? null;
  const mission = found?.status === "active" ? found : null;

  const [sheetOpen, setSheetOpen] = useState(false);
  const [view, setView] = useState<SheetView>("options");
  const [pendingAt, setPendingAt] = useState<Date | null>(null);
  const [subscribing, setSubscribing] = useState(false);
  const support = usePushSupport();
  // The proof form lives on this screen, not a separate check-in screen.
  // ?done=1 (the Start card's I DID IT) lands straight on the proof form.
  const [recording, setRecording] = useState(search.get("done") === "1");
  const [proofText, setProofText] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [logging, setLogging] = useState(false);
  const submitting = useRef(false);

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
      router.replace(`/action/complete/${found.id}`);
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
        "Notifications are off for this site. We'll flag it in-app instead.",
      );
      return;
    }
    showToast(IN_APP_TOAST);
  }

  function keepInAppOnly() {
    dismiss();
    showToast(IN_APP_TOAST);
  }

  async function logProof() {
    if (submitting.current || !mission || !proofText.trim()) return;
    submitting.current = true;
    setLogging(true);
    try {
      const completed = await store.completeMission(mission.id, {
        reflection: proofText,
        photo_url: photo,
      });
      track("freeform_mission_completed", {
        selectedTrigger: completed.trigger,
      });
      if (photo) track("proof_photo_added", { missionNumber: null });
      clearReminderFor(completed.id);
      router.replace(`/action/complete/${completed.id}`);
    } catch {
      submitting.current = false;
      setLogging(false);
      showToast("Couldn't log your proof. Please try again.", {
        retry: () => void logProof(),
      });
    }
  }

  const sheetTitle =
    view === "explainer"
      ? REMINDER_EXPLAINER_TITLE
      : view === "ios"
        ? "GET REMINDERS ON IPHONE"
        : "REMIND ME LATER";

  const meta = TRIGGERS[mission.trigger];
  const tone = TRIGGER_ACCENTS[mission.trigger];

  // Record the proof right here — no separate check-in screen to tap through.
  if (recording) {
    return (
      <main className="flex flex-1 flex-col pt-2">
        <div className="flex justify-end">
          <NavAction kind="close" onClick={() => setRecording(false)} />
        </div>

        <div className="mt-6">
          <Eyebrow accent={mission.trigger}>{meta.name}</Eyebrow>
          <Headline className="mt-3">RECORD THE EVIDENCE</Headline>
          <p className="font-display mt-5 text-[22px] leading-tight text-ink-0">
            {mission.action_text}
          </p>
        </div>

        <div className="mt-7">
          <Field
            label="What did you do?"
            value={proofText}
            onChange={setProofText}
            maxLength={PROOF_TEXT_MAX}
            multiline
            autoFocus
            placeholder="I sent the email and asked for the conversation."
          />
        </div>
        <div className="mt-4">
          <PhotoInput value={photo} onChange={setPhoto} />
        </div>

        <BottomActions className="pt-8">
          <Button
            loading={logging}
            disabled={!proofText.trim()}
            onClick={() => void logProof()}
          >
            LOG THE PROOF
          </Button>
        </BottomActions>
      </main>
    );
  }

  return (
    <main className="relative flex flex-1 flex-col pt-2">
      <div className="flex justify-end">
        <NavAction kind="close" href="/home" />
      </div>

      {/* The Trigger step of S.T.A.R. lives here — on the screen he is looking
          at while he sprays, rather than behind one more tap. */}
      <div className="relative mt-2 flex flex-col items-center overflow-hidden py-4">
        <span
          aria-hidden
          className="ghost-word top-0 left-1/2 -translate-x-1/2 text-[64px]"
        >
          {meta.name}
        </span>
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{ background: tone.glow }}
        />
        <BottleVisual trigger={mission.trigger} size={104} className="relative" />
      </div>

      <Eyebrow accent={mission.trigger} className="mt-4">
        {meta.name}
      </Eyebrow>
      <h1 className="font-display mt-3 text-[28px] leading-tight text-ink-0">
        {mission.action_text}
      </h1>

      <p className="eyebrow mt-6 text-gold-300">
        SPRAY THE FRAGRANCE. RECALL A MOMENT YOU WERE {meta.anchorWord}.
        5–15 SECONDS.
      </p>
      <p className="mt-5 text-[17px] text-ink-1">Phone down. Go do it.</p>
      <StoicQuoteBlock quote={quoteForMission(mission.trigger, mission.id)} />

      <BottomActions className="pt-8">
        <Button onClick={() => setRecording(true)}>I DID IT</Button>
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

export default function ActiveActionPage(props: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <ActiveActionInner {...props} />
    </Suspense>
  );
}
