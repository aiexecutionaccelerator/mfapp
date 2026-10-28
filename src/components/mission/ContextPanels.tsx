"use client";

import { Copy, Lock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Eyebrow from "@/components/ui/Eyebrow";
import { useToast } from "@/components/ui/Toast";
import { TRIGGERS } from "@/content/triggers";
import {
  recordText,
  type Blocker,
} from "@/lib/curriculum";
import type { Mission, MissionContext } from "@/lib/data/types";
import { copyText } from "@/lib/share";
import { formatDate, formatDay } from "@/lib/utils";

/**
 * His own saved work, shown under Act: the promise from 12, the focus and
 * aim from 21, the practice from 27, his Personal Code, recent actions.
 * Context, never a suggested answer. It reads as a quiet card, not as text
 * he could take.
 */

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass mt-4 rounded-[14px] p-4">
      <Eyebrow tone="gold">{title}</Eyebrow>
      <div className="mt-2 text-[15px] leading-snug text-ink-0">{children}</div>
    </div>
  );
}

export function ContextPanels({
  context,
  missionNumber,
  recent,
  selectableCode = false,
}: {
  context: MissionContext;
  missionNumber: number;
  recent?: Mission[] | null;
  /** Mission 29: tick lines to copy for sharing. Copying never completes it. */
  selectableCode?: boolean;
}) {
  return (
    <>
      {context.code && context.code.length > 0 && (
        <CodePanel lines={context.code} selectable={selectableCode} />
      )}
      {context.promise && (
        <Panel title="YOUR PROMISE · MISSION 12">
          <p className="whitespace-pre-wrap">{context.promise}</p>
        </Panel>
      )}
      {context.aim && (
        <Panel title="YOUR FOCUS & SEVEN-DAY AIM · MISSION 21">
          {context.focus && (
            <p className="eyebrow text-ink-2">{context.focus.toUpperCase()}</p>
          )}
          <p className="mt-1 whitespace-pre-wrap">{context.aim}</p>
        </Panel>
      )}
      {context.practice && (
        <Panel title="YOUR PRACTICE · MISSION 27">
          <p className="whitespace-pre-wrap">{context.practice.text}</p>
          <p className="mt-2 text-[13px] text-ink-2">
            {[
              context.practice.frequency,
              TRIGGERS[context.practice.trigger].name,
              context.practice.review_date &&
                `Review ${formatDay(context.practice.review_date)}`,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </Panel>
      )}
      {recent && recent.length > 0 && (
        <Panel
          title={
            missionNumber === 28 ? "FROM YOUR PROOF LOG" : "YOUR RECENT ACTIONS"
          }
        >
          <ul className="space-y-3">
            {recent.map((m) => (
              <li key={m.id}>
                <p className="whitespace-pre-wrap">{recordText(m)}</p>
                <p className="mt-0.5 text-[13px] text-ink-2">
                  {m.mission_number ? `Mission ${m.mission_number}` : "One-Off Action"}
                  {m.completed_at ? ` · ${formatDate(m.completed_at)}` : ""}
                </p>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </>
  );
}

function CodePanel({
  lines,
  selectable,
}: {
  lines: { label: string; value: string }[];
  selectable: boolean;
}) {
  const { showToast } = useToast();
  const [picked, setPicked] = useState<Set<number>>(new Set());

  return (
    <Panel title="MY PERSONAL CODE">
      <ul className="space-y-3">
        {lines.map((line, i) => (
          <li key={line.label}>
            {selectable ? (
              <label className="flex min-h-11 cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={picked.has(i)}
                  onChange={(e) => {
                    const next = new Set(picked);
                    if (e.target.checked) next.add(i);
                    else next.delete(i);
                    setPicked(next);
                  }}
                  className="mt-1 h-5 w-5 shrink-0 accent-[var(--gold-500)]"
                />
                <span>
                  <span className="block text-[13px] text-ink-2">{line.label}</span>
                  <span className="mt-0.5 block">{line.value}</span>
                </span>
              </label>
            ) : (
              <>
                <p className="text-[13px] text-ink-2">{line.label}</p>
                <p className="mt-0.5">{line.value}</p>
              </>
            )}
          </li>
        ))}
      </ul>
      {selectable && (
        <button
          type="button"
          disabled={picked.size === 0}
          onClick={async () => {
            const text = lines
              .filter((_, i) => picked.has(i))
              .map((l) => `${l.label} ${l.value}`)
              .join("\n");
            const ok = await copyText(text);
            showToast(
              ok
                ? "Copied. Now share it with someone you trust."
                : "Couldn't copy those lines.",
            );
          }}
          className="mt-3 inline-flex min-h-11 items-center gap-2 text-[14px] font-semibold tracking-[0.08em] text-gold-300 disabled:opacity-40"
        >
          <Copy size={16} aria-hidden />
          COPY SELECTED LINES
        </button>
      )}
    </Panel>
  );
}

/** What's missing before this Mission can be completed, with the way back. */
export function BlockerPanel({ blockers }: { blockers: Blocker[] }) {
  if (!blockers.length) return null;
  return (
    <div
      className="mt-4 rounded-[14px] border border-[rgba(201,166,72,.45)] bg-[rgba(201,166,72,.06)] p-4"
      role="note"
    >
      <p className="eyebrow flex items-center gap-2 text-gold-300">
        <Lock aria-hidden size={14} />
        BEFORE YOU COMPLETE THIS MISSION
      </p>
      <ul className="mt-3 space-y-4">
        {blockers.map((b) => (
          <li key={b.href + b.message}>
            <p className="text-[15px] leading-snug text-ink-0">{b.message}</p>
            <Link
              href={b.href}
              className="mt-1 inline-flex min-h-11 items-center text-[13px] font-semibold tracking-[0.08em] text-gold-300"
            >
              {b.cta} →
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[13px] text-ink-2">
        You can still read this Mission and save a draft.
      </p>
    </div>
  );
}
