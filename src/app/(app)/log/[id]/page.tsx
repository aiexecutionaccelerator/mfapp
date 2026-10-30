"use client";

import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import NavAction from "@/components/NavAction";
import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import Field from "@/components/ui/Field";
import Headline from "@/components/ui/Headline";
import Sheet from "@/components/ui/Sheet";
import Spinner from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { recordTitle } from "@/components/MissionRow";
import { TRIGGERS } from "@/content/triggers";
import { track } from "@/lib/analytics";
import { KIND_LABELS, kindOf } from "@/lib/curriculum";
import { store, useAppData } from "@/lib/data/store";
import { ConflictError, PROOF_TEXT_MAX, ValidationError } from "@/lib/data/types";
import { formatDateTime } from "@/lib/utils";

export default function LogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { showToast } = useToast();
  const { missions, error } = useAppData();
  const mission = missions?.find((m) => m.id === id) ?? null;

  const [editing, setEditing] = useState(false);
  const [text, setText] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [pending, setPending] = useState(false);

  // Leave only when the record really isn't there. A failed background
  // refresh with the record still in hand is no reason to bounce him out.
  useEffect(() => {
    if ((error && !missions) || (missions && !mission)) router.replace("/log");
  }, [error, missions, mission, router]);

  if (!mission) {
    return (
      <main className="flex flex-1 items-center justify-center text-ink-2">
        <Spinner />
      </main>
    );
  }

  const isMission = mission.mission_number !== null;

  // One entry, one sentence. Rows from the old declare-then-record flow kept
  // two, so the declared half is shown separately only when it differs.
  const proofText = mission.reflection ?? mission.action_text;
  const declaredSeparately =
    mission.reflection !== null && mission.action_text !== mission.reflection
      ? mission.action_text
      : null;
  const legacyAnswer =
    mission.question_answer && mission.question_answer !== proofText
      ? mission.question_answer
      : null;

  /** A Mission record is edited on its Mission, with all its fields. */
  function startEditing() {
    if (!mission) return;
    if (isMission && mission.status === "completed") {
      router.push(`/missions/${mission.mission_number}`);
      return;
    }
    setText(proofText);
    setEditing(true);
  }

  async function saveEdits() {
    if (!mission || !text.trim()) return;
    const next = text.trim().slice(0, PROOF_TEXT_MAX);
    setPending(true);
    try {
      await store.editRecord(mission, { text: next });
      track("proof_entry_edited", { missionNumber: mission.mission_number });
      setEditing(false);
    } catch (cause) {
      showToast(
        cause instanceof ValidationError || cause instanceof ConflictError
          ? cause.message
          : "Couldn't save that. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }

  /**
   * Removing keeps the record, its words and its date; it just stops
   * counting. Restore brings back the same record.
   */
  async function setRemoved(removed: boolean) {
    if (!mission) return;
    setPending(true);
    try {
      await store.setRemoved(mission.id, removed);
      track(removed ? "proof_entry_removed" : "proof_entry_restored", {
        missionNumber: mission.mission_number,
      });
      setConfirmRemove(false);
      setEditing(false);
      showToast(removed ? "Removed. You can restore it from the Proof Log." : "Restored.");
    } catch {
      showToast("Couldn't do that. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="pt-2 pb-8">
      {/* While editing, back is Cancel — one affordance, not two. */}
      {editing ? (
        <NavAction kind="back" onClick={() => setEditing(false)} />
      ) : (
        <NavAction kind="back" href="/log" />
      )}

      <div className="mt-6">
        <Eyebrow accent={mission.trigger}>
          {TRIGGERS[mission.trigger].name}
        </Eyebrow>
        <p className="eyebrow mt-2 text-gold-300">{recordTitle(mission)}</p>
        {editing ? (
          <div className="mt-4">
            <Field
              label="What you did"
              value={text}
              onChange={setText}
              maxLength={PROOF_TEXT_MAX}
              multiline
            />
          </div>
        ) : (
          <Headline level={2} className="mt-3 break-words">
            {proofText}
          </Headline>
        )}
      </div>

      <dl className="glass mt-6 space-y-3 rounded-[20px] p-5 text-[15px]">
        <div className="flex justify-between gap-4">
          <dt className="text-ink-2">Logged</dt>
          <dd className="text-ink-0">
            {formatDateTime(mission.completed_at ?? mission.started_at)}
          </dd>
        </div>
        {mission.status === "completed" && (
          <div className="flex justify-between gap-4">
            <dt className="text-ink-2">Type</dt>
            <dd className="text-ink-0">{KIND_LABELS[kindOf(mission)]}</dd>
          </div>
        )}
        {mission.status !== "completed" && (
          <div className="flex justify-between gap-4">
            <dt className="text-ink-2">Status</dt>
            <dd className="text-gold-300">NOT LOGGED YET</dd>
          </div>
        )}
        {mission.removed_at && (
          <div className="flex justify-between gap-4">
            <dt className="text-ink-2">Removed</dt>
            <dd className="text-ink-0">{formatDateTime(mission.removed_at)}</dd>
          </div>
        )}
      </dl>

      {/* Editing is the words only. Adding a photo here was a leftover from
          the old flow — the only place in the app it still appeared. */}
      {!editing && (
        <>
          {declaredSeparately && (
            <div className="glass mt-4 rounded-[20px] p-5">
              <Eyebrow>DECLARED</Eyebrow>
              <p className="mt-3 text-[17px] text-ink-0">{declaredSeparately}</p>
            </div>
          )}
          {legacyAnswer && (
            <div className="glass mt-4 rounded-[20px] p-5">
              <Eyebrow>YOUR ANSWER</Eyebrow>
              <p className="mt-3 text-[17px] leading-relaxed whitespace-pre-wrap text-ink-0">
                {legacyAnswer}
              </p>
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
              disabled={!text.trim()}
              onClick={() => void saveEdits()}
            >
              SAVE
            </Button>
            <Button variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </>
        ) : mission.removed_at ? (
          <Button loading={pending} onClick={() => void setRemoved(false)}>
            RESTORE
          </Button>
        ) : (
          <>
            {mission.status === "active" && (
              <Button
                onClick={() =>
                  router.push(
                    mission.mission_number !== null
                      ? `/missions/${mission.mission_number}`
                      : `/action/active/${mission.id}`,
                  )
                }
              >
                FINISH THIS ACTION
              </Button>
            )}
            {mission.status === "completed" && (
              <Button variant="secondary" onClick={startEditing}>
                {isMission ? "Edit on its Mission" : "Edit this entry"}
              </Button>
            )}
            {mission.status === "completed" && (
              <Button variant="ghost" onClick={() => setConfirmRemove(true)}>
                Remove this record
              </Button>
            )}
          </>
        )}
      </div>

      <Sheet
        open={confirmRemove}
        title="REMOVE THIS RECORD?"
        note={
          mission.mission_number !== null
            ? `It stops counting, and Mission ${mission.mission_number} reads Removed. Your words and date are kept. You can restore it any time.`
            : "It stops counting. Your words and date are kept. You can restore it any time."
        }
        onClose={() => setConfirmRemove(false)}
      >
        <Button variant="danger" loading={pending} onClick={() => void setRemoved(true)}>
          REMOVE
        </Button>
        <Button variant="ghost" onClick={() => setConfirmRemove(false)}>
          Cancel
        </Button>
      </Sheet>
    </main>
  );
}
