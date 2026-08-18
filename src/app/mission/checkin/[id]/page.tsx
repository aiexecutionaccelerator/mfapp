"use client";

import { useRouter } from "next/navigation";
import { use, useEffect, useRef, useState } from "react";
import NavAction from "@/components/NavAction";
import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import Field from "@/components/ui/Field";
import Headline from "@/components/ui/Headline";
import Sheet from "@/components/ui/Sheet";
import { useToast } from "@/components/ui/Toast";
import { TRIGGERS } from "@/content/triggers";
import { data } from "@/lib/data";
import type { Mission } from "@/lib/data/types";
import { clearReminderFor } from "@/lib/utils";

type View = "ask" | "yes" | "not-yet" | "edit";

export default function CheckinPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { showToast } = useToast();

  const [mission, setMission] = useState<Mission | null>(null);
  const [view, setView] = useState<View>("ask");
  const [reflection, setReflection] = useState("");
  const [actionText, setActionText] = useState("");
  const [pending, setPending] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const submitting = useRef(false);

  useEffect(() => {
    data
      .getMission(id)
      .then((found) => {
        if (!found) {
          router.replace("/home");
          return;
        }
        if (found.status === "completed") {
          router.replace(`/mission/complete/${found.id}`);
          return;
        }
        if (found.status === "ended") {
          router.replace("/home");
          return;
        }
        setMission(found);
        setActionText(found.action_text);
      })
      .catch(() => router.replace("/home"));
  }, [id, router]);

  if (!mission) return null;

  async function complete() {
    if (submitting.current || !mission) return;
    submitting.current = true;
    setPending(true);
    try {
      const completed = await data.completeMission(mission.id, reflection);
      clearReminderFor(completed.id);
      router.replace(`/mission/complete/${completed.id}`);
    } catch {
      submitting.current = false;
      setPending(false);
      showToast("Couldn't save that. Please try again.", {
        retry: () => void complete(),
      });
    }
  }

  async function save() {
    if (!mission) return;
    const trimmed = actionText.trim();
    if (!trimmed) return;
    setPending(true);
    try {
      await data.updateMissionAction(mission.id, trimmed);
      router.replace(`/mission/active/${mission.id}`);
    } catch {
      setPending(false);
      showToast("Couldn't save that. Please try again.", {
        retry: () => void save(),
      });
    }
  }

  async function end() {
    if (!mission) return;
    setPending(true);
    try {
      await data.endMission(mission.id);
      clearReminderFor(mission.id);
      setConfirmEnd(false);
      showToast("Mission ended. No penalty. Start again anytime.");
      router.replace("/home");
    } catch {
      setPending(false);
      showToast("Couldn't save that. Please try again.", {
        retry: () => void end(),
      });
    }
  }

  return (
    <main className="flex min-h-dvh flex-col pt-[calc(env(safe-area-inset-top)+8px)]">
      <div className="flex justify-end">
        <NavAction kind="close" href="/home" />
      </div>

      <div className="mt-10 flex-1">
        <Eyebrow accent={mission.trigger}>
          {TRIGGERS[mission.trigger].name}
        </Eyebrow>

        {view === "not-yet" || view === "edit" ? (
          <>
            <p className="mt-4 text-[22px] leading-snug text-ink-0">
              That&apos;s okay. The Mission isn&apos;t over.
            </p>

            {view === "edit" ? (
              <div className="mt-8 space-y-3">
                <Field
                  label="Your action"
                  value={actionText}
                  onChange={setActionText}
                  maxLength={140}
                  autoFocus
                />
                <Button
                  loading={pending}
                  disabled={!actionText.trim()}
                  onClick={save}
                >
                  SAVE
                </Button>
              </div>
            ) : (
              <div className="mt-8 space-y-3">
                <Button
                  onClick={() => router.push(`/mission/active/${mission.id}`)}
                >
                  TRY AGAIN
                </Button>
                <Button variant="secondary" onClick={() => setView("edit")}>
                  EDIT MISSION
                </Button>
                <Button variant="danger" onClick={() => setConfirmEnd(true)}>
                  END MISSION
                </Button>
              </div>
            )}
          </>
        ) : (
          <>
            <Headline className="mt-3">DID YOU DO IT?</Headline>
            <p className="font-display mt-6 text-[26px] leading-tight text-ink-0">
              {mission.action_text}
            </p>

            {view === "yes" ? (
              <div className="mt-8 space-y-3">
                <Field
                  label="What happened? (optional)"
                  value={reflection}
                  onChange={setReflection}
                  maxLength={500}
                  multiline
                  autoFocus
                />
                <Button loading={pending} onClick={complete}>
                  COMPLETE MISSION
                </Button>
              </div>
            ) : (
              <div className="mt-10 space-y-3">
                <Button onClick={() => setView("yes")}>
                  YES — MISSION COMPLETE
                </Button>
                <Button variant="secondary" onClick={() => setView("not-yet")}>
                  NOT YET
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <Sheet
        open={confirmEnd}
        title="End this Mission?"
        note="It will be recorded as ended, not completed."
        onClose={() => setConfirmEnd(false)}
      >
        <Button variant="danger" loading={pending} onClick={end}>
          END MISSION
        </Button>
        <Button variant="ghost" onClick={() => setConfirmEnd(false)}>
          Keep going
        </Button>
      </Sheet>
    </main>
  );
}
