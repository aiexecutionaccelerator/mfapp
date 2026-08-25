"use client";

import { useRouter } from "next/navigation";
import { use, useEffect, useRef, useState } from "react";
import NavAction from "@/components/NavAction";
import PhotoInput from "@/components/PhotoInput";
import BottomActions from "@/components/ui/BottomActions";
import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import Field from "@/components/ui/Field";
import Headline from "@/components/ui/Headline";
import { useToast } from "@/components/ui/Toast";
import { TRIGGERS } from "@/content/triggers";
import { track } from "@/lib/analytics";
import { useAppData, store } from "@/lib/data/store";
import { PROOF_TEXT_MAX } from "@/lib/data/types";
import { clearReminderFor } from "@/lib/utils";

type View = "ask" | "yes" | "not-yet";

export default function CheckinPage({
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

  const [view, setView] = useState<View>("ask");
  const [proofText, setProofText] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
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
      router.replace(`/mission/complete/${found.id}`);
    }
  }, [error, missions, found, router]);

  if (!mission) return null;

  async function complete() {
    if (submitting.current || !mission || !proofText.trim()) return;
    submitting.current = true;
    setPending(true);
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
      router.replace(`/mission/complete/${completed.id}`);
    } catch {
      submitting.current = false;
      setPending(false);
      showToast("Couldn't save that. Please try again.", {
        retry: () => void complete(),
      });
    }
  }

  return (
    <main className="flex flex-1 flex-col pt-2">
      <div className="flex justify-end">
        <NavAction kind="close" href="/home" />
      </div>

      <div className="mt-10">
        <Eyebrow accent={mission.trigger}>
          {TRIGGERS[mission.trigger].name}
        </Eyebrow>

        {view === "not-yet" ? (
          <h1 className="mt-4 text-[22px] leading-snug text-ink-0">
            That&apos;s okay. The Mission isn&apos;t over.
          </h1>
        ) : view === "yes" ? (
          <>
            <Headline className="mt-3">RECORD THE EVIDENCE</Headline>
            <p className="font-display mt-5 text-[22px] leading-tight text-ink-0">
              {mission.action_text}
            </p>
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
          </>
        ) : (
          <>
            <Headline className="mt-3">DID YOU DO IT?</Headline>
            <p className="font-display mt-6 text-[26px] leading-tight text-ink-0">
              {mission.action_text}
            </p>
          </>
        )}
      </div>

      <BottomActions className="pt-8">
        {view === "not-yet" ? (
          <Button onClick={() => router.push(`/mission/active/${mission.id}`)}>
            TRY AGAIN
          </Button>
        ) : view === "yes" ? (
          <Button
            loading={pending}
            disabled={!proofText.trim()}
            onClick={complete}
          >
            LOG THE PROOF
          </Button>
        ) : (
          <>
            <Button onClick={() => setView("yes")}>
              YES — I DID IT
            </Button>
            <Button variant="secondary" onClick={() => setView("not-yet")}>
              NOT YET
            </Button>
          </>
        )}
      </BottomActions>
    </main>
  );
}
