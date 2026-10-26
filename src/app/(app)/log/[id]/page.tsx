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
import { getMissionDef } from "@/content/missions";
import { TRIGGERS } from "@/content/triggers";
import { track } from "@/lib/analytics";
import { store, useAppData } from "@/lib/data/store";
import { PROOF_TEXT_MAX } from "@/lib/data/types";
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

  function startEditing() {
    if (!mission) return;
    setText(proofText);
    setEditing(true);
  }

  async function saveEdits() {
    if (!mission || !text.trim()) return;
    const next = text.trim().slice(0, PROOF_TEXT_MAX);
    setPending(true);
    try {
      await store.updateMission(mission.id, {
        action_text: next,
        ...(mission.status === "completed"
          ? { reflection: next }
          : {}),
      });
      track("proof_entry_edited", { missionNumber: mission.mission_number });
      setEditing(false);
    } catch {
      showToast("Couldn't save that. Please try again.", {
        retry: () => void saveEdits(),
      });
    } finally {
      setPending(false);
    }
  }

  /** The row goes entirely — a Mission simply reads Not Started again. */
  async function deleteEntry() {
    if (!mission) return;
    setPending(true);
    try {
      await store.deleteMission(mission.id);
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
        <p className="eyebrow mt-2 text-gold-300">
          {def ? `MISSION ${def.number} · ${def.title.toUpperCase()}` : "ONE-OFF ACTION"}
        </p>
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
        {mission.status !== "completed" && (
          <div className="flex justify-between gap-4">
            <dt className="text-ink-2">Status</dt>
            <dd className="text-gold-300">NOT LOGGED YET</dd>
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
            {/* Deleting lives in here with the other edits — the entry you
                are only reading has one button. */}
            <Button variant="ghost" onClick={() => setConfirmDelete(true)}>
              Delete entry
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
                      : `/action/active/${mission.id}`,
                  )
                }
              >
                FINISH THIS ACTION
              </Button>
            )}
            <Button variant="secondary" onClick={startEditing}>
              Edit or delete this entry
            </Button>
          </>
        )}
      </div>

      <Sheet
        open={confirmDelete}
        title="DELETE THIS ENTRY?"
        note={
          mission.mission_number !== null
            ? `This removes the proof and Mission ${mission.mission_number} reads Not Started again. This can't be undone.`
            : "This removes the entry from your Proof Log. This can't be undone."
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
