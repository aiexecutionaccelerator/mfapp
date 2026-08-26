"use client";

import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import NavAction from "@/components/NavAction";
import PhotoInput from "@/components/PhotoInput";
import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import Field from "@/components/ui/Field";
import Headline from "@/components/ui/Headline";
import Sheet from "@/components/ui/Sheet";
import Spinner from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { getMissionDef } from "@/content/missions";
import { TRIGGERS } from "@/content/triggers";
import { track } from "@/lib/analytics";
import { store, useAppData } from "@/lib/data/store";
import { PROOF_TEXT_MAX } from "@/lib/data/types";
import { formatDateTime } from "@/lib/utils";

const STATUS_LABEL = {
  completed: "COMPLETE",
  active: "IN PROGRESS",
  ended: "ENDED",
} as const;

export default function LogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { showToast } = useToast();
  const { missions, lessonResponses, error } = useAppData();
  const mission = missions?.find((m) => m.id === id) ?? null;

  const [editing, setEditing] = useState(false);
  const [actionText, setActionText] = useState("");
  const [proofText, setProofText] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (error || (missions && !mission)) router.replace("/log");
  }, [error, missions, mission, router]);

  if (!mission) {
    return (
      <main className="flex flex-1 items-center justify-center text-ink-2">
        <Spinner />
      </main>
    );
  }

  const def =
    mission.mission_number !== null
      ? getMissionDef(mission.mission_number)
      : undefined;

  function startEditing() {
    if (!mission) return;
    setActionText(mission.action_text);
    setProofText(mission.reflection ?? "");
    setPhoto(mission.photo_url);
    setEditing(true);
  }

  async function saveEdits() {
    if (!mission || !actionText.trim()) return;
    setPending(true);
    try {
      await store.updateMission(mission.id, {
        action_text: actionText.trim().slice(0, 140),
        ...(mission.status === "completed"
          ? { reflection: proofText.trim() || null, photo_url: photo }
          : {}),
      });
      track("proof_entry_edited", {
        missionNumber: mission.mission_number,
      });
      setEditing(false);
    } catch {
      showToast("Couldn't save that. Please try again.", {
        retry: () => void saveEdits(),
      });
    } finally {
      setPending(false);
    }
  }

  /**
   * Deleting a structured Proof keeps the declared action, so the Mission
   * reverts to in progress (spec §8). A free-form entry is removed entirely.
   */
  async function deleteEntry() {
    if (!mission) return;
    setPending(true);
    try {
      if (mission.mission_number !== null && mission.status === "completed") {
        await store.uncompleteMission(mission.id);
        showToast(
          `Proof deleted. Mission ${mission.mission_number} is back in progress.`,
        );
      } else {
        await store.deleteMission(mission.id);
      }
      track("proof_entry_deleted", { missionNumber: mission.mission_number });
      router.replace("/log");
    } catch {
      setPending(false);
      setConfirmDelete(false);
      showToast("Couldn't delete that. Please try again.");
    }
  }

  return (
    <main className="pt-2 pb-8">
      <NavAction kind="back" href="/log" />

      <div className="mt-6">
        <Eyebrow accent={mission.trigger}>
          {TRIGGERS[mission.trigger].name}
        </Eyebrow>
        {def && (
          <p className="eyebrow mt-2 text-gold-300">
            MISSION {def.number} · {def.title.toUpperCase()}
          </p>
        )}
        {editing ? (
          <div className="mt-4">
            <Field
              label="Declared action"
              value={actionText}
              onChange={setActionText}
              maxLength={140}
            />
          </div>
        ) : (
          <Headline level={2} className="mt-3 break-words">
            {mission.action_text}
          </Headline>
        )}
      </div>

      <dl className="glass mt-6 space-y-3 rounded-[20px] p-5 text-[15px]">
        <div className="flex justify-between gap-4">
          <dt className="text-ink-2">Status</dt>
          <dd className="text-ink-0">{STATUS_LABEL[mission.status]}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ink-2">Declared</dt>
          <dd className="text-ink-0">{formatDateTime(mission.started_at)}</dd>
        </div>
        {mission.completed_at && (
          <div className="flex justify-between gap-4">
            <dt className="text-ink-2">Completed</dt>
            <dd className="text-ink-0">
              {formatDateTime(mission.completed_at)}
            </dd>
          </div>
        )}
      </dl>

      {editing && mission.status === "completed" ? (
        <div className="mt-4 space-y-4">
          <Field
            label="What did you do?"
            value={proofText}
            onChange={setProofText}
            maxLength={PROOF_TEXT_MAX}
            multiline
          />
          <PhotoInput value={photo} onChange={setPhoto} />
        </div>
      ) : (
        <>
          {def &&
            (() => {
              // Prefer the live answer (still editable on the Mission) over
              // the snapshot taken at declare time.
              const answer =
                lessonResponses?.find(
                  (r) => r.lesson_id === def.slug && r.prompt_id === "q",
                )?.answer ?? mission.question_answer;
              if (!answer) return null;
              return (
                <div className="glass mt-4 rounded-[20px] p-5">
                  <Eyebrow>YOUR ANSWER</Eyebrow>
                  <p className="mt-2 text-[13px] leading-snug text-ink-2">
                    {def.question}
                  </p>
                  <p className="mt-3 text-[17px] leading-relaxed whitespace-pre-wrap text-ink-0">
                    {answer}
                  </p>
                </div>
              );
            })()}
          {mission.reflection && (
            <div className="glass mt-4 rounded-[20px] p-5">
              <Eyebrow>WHAT YOU DID</Eyebrow>
              <p className="mt-3 text-[17px] text-ink-0">{mission.reflection}</p>
            </div>
          )}
          {mission.photo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mission.photo_url}
              alt="Your proof photo"
              className="mt-4 w-full rounded-[20px]"
            />
          )}
        </>
      )}

      <div className="mt-6 space-y-3">
        {editing ? (
          <>
            <Button
              loading={pending}
              disabled={!actionText.trim()}
              onClick={() => void saveEdits()}
            >
              SAVE
            </Button>
            <Button variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            {mission.status === "active" && (
              <Button
                onClick={() =>
                  router.push(
                    mission.mission_number !== null
                      ? `/missions/${mission.mission_number}`
                      : `/mission/active/${mission.id}`,
                  )
                }
              >
                OPEN MISSION
              </Button>
            )}
            <Button variant="secondary" onClick={startEditing}>
              Edit entry
            </Button>
            <Button variant="ghost" onClick={() => setConfirmDelete(true)}>
              Delete entry
            </Button>
          </>
        )}
      </div>

      <Sheet
        open={confirmDelete}
        title="DELETE THIS ENTRY?"
        note={
          mission.mission_number !== null && mission.status === "completed"
            ? `The proof is removed and Mission ${mission.mission_number} goes back to in progress. Your declared action stays.`
            : "This removes the entry from your Mission Log. This can't be undone."
        }
        onClose={() => setConfirmDelete(false)}
      >
        <Button variant="danger" loading={pending} onClick={() => void deleteEntry()}>
          DELETE ENTRY
        </Button>
        <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
          Cancel
        </Button>
      </Sheet>
    </main>
  );
}
