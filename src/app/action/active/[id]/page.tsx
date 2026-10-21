"use client";

import { useRouter } from "next/navigation";
import { use, useEffect, useRef, useState } from "react";
import NavAction from "@/components/NavAction";
import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import Field from "@/components/ui/Field";
import GlassCard from "@/components/ui/GlassCard";
import Headline from "@/components/ui/Headline";
import Spinner from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { TRIGGERS } from "@/content/triggers";
import { store, useAppData } from "@/lib/data/store";
import { PROOF_TEXT_MAX } from "@/lib/data/types";

/**
 * Finish an action that was declared under the old two-step flow.
 *
 * Nothing creates these any more — declaring and recording are one click now —
 * but a man who left one open before the change still needs a way to close it.
 * Same shape as everywhere else: one field, one button.
 */
export default function FinishActionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { showToast } = useToast();
  const { missions } = useAppData();

  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const submitting = useRef(false);

  const row = missions?.find((m) => m.id === id) ?? null;

  useEffect(() => {
    if (missions && !row) router.replace("/missions");
  }, [missions, row, router]);

  useEffect(() => {
    if (row?.status === "completed") router.replace(`/log/${row.id}`);
  }, [row, router]);

  if (!missions || !row) {
    return (
      <main className="flex flex-1 items-center justify-center text-ink-2">
        <Spinner />
      </main>
    );
  }

  async function finish() {
    const entry = text.trim();
    if (submitting.current || !row || !entry) return;
    submitting.current = true;
    setPending(true);
    try {
      await store.logProof({
        trigger: row.trigger,
        action_text: entry.slice(0, PROOF_TEXT_MAX),
        existingId: row.id,
      });
      router.replace("/log");
    } catch {
      submitting.current = false;
      setPending(false);
      showToast("Couldn't log that. Please try again.");
    }
  }

  return (
    <main className="flex flex-1 flex-col pt-2">
      <div className="flex justify-end">
        <NavAction kind="close" href="/missions" />
      </div>

      <Headline className="mt-4">FINISH THIS ACTION</Headline>

      <GlassCard accent={row.trigger} className="mt-6">
        <Eyebrow accent={row.trigger} tone="gold">
          {TRIGGERS[row.trigger].name}
        </Eyebrow>
        <p className="font-display mt-3 text-[22px] leading-tight text-ink-0">
          {row.action_text}
        </p>
      </GlassCard>

      <div className="mt-7">
        <Field
          variant="prominent"
          label="What did you do?"
          value={text}
          onChange={setText}
          maxLength={PROOF_TEXT_MAX}
          multiline
          rows={4}
          placeholder="Short and specific."
        />
      </div>

      <div className="mt-4">
        <Button
          loading={pending}
          disabled={!text.trim()}
          onClick={() => void finish()}
        >
          LOG THIS ACTION
        </Button>
      </div>
    </main>
  );
}
