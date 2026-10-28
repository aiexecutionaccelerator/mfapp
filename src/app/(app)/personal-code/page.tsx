"use client";

import { ChevronRight, Printer } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import NavAction from "@/components/NavAction";
import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import Headline from "@/components/ui/Headline";
import Spinner from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import Wordmark from "@/components/Wordmark";
import { track } from "@/lib/analytics";
import { store, useAppData } from "@/lib/data/store";
import { ConflictError, ValidationError } from "@/lib/data/types";
import { compilePersonalCode, type PersonalCodeLine } from "@/lib/personalCode";

/**
 * My Personal Code — one page, printable with the browser's own print. Each
 * line is edited in place and written back to its record (the identity to
 * the profile and Mission 13 together), so the code, the Missions, and
 * Settings never disagree.
 */
export default function PersonalCodePage() {
  const { showToast } = useToast();
  const { profile, missions, error, refresh } = useAppData();

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    track("personal_code_viewed");
  }, []);

  useEffect(() => {
    if (!error) return;
    showToast("Couldn't load your Personal Code.", {
      retry: () => void refresh(),
    });
  }, [error, refresh, showToast]);

  if (!profile || !missions) {
    return (
      <main className="flex flex-1 items-center justify-center text-ink-2">
        <Spinner />
      </main>
    );
  }

  const lines = compilePersonalCode(profile, missions);
  // Only written lines are cards. The rest are one quiet sentence — six
  // tappable "not written yet" placeholders is a chore list, not a code.
  const written = lines.filter((line) => line.value);
  const unwritten = lines.filter((line) => !line.value);

  async function saveLine(line: PersonalCodeLine) {
    const value = draft.trim();
    if (!value) return;
    setPending(true);
    try {
      // The identity line is also the profile field Settings shows.
      if (line.key === "identity") await store.updateIdentity(value);
      else if (line.record) await store.editRecord(line.record, { text: value });
      track("personal_code_edited", { line: line.key });
      setEditingKey(null);
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

  return (
    <main className="print-page pt-2 pb-10">
      <div className="print-hide flex items-center justify-between">
        <NavAction kind="back" href="/progress" />
        <button
          type="button"
          onClick={() => window.print()}
          aria-label="Print my Personal Code"
          className="flex h-12 w-12 items-center justify-center text-ink-1"
        >
          <Printer size={22} aria-hidden />
        </button>
      </div>

      <div className="mt-4 flex justify-center">
        <Wordmark />
      </div>
      <Headline className="mt-6 text-center">MY PERSONAL CODE</Headline>
      {profile.display_name && (
        <p className="mt-2 text-center text-[15px] text-ink-1">
          {profile.display_name}
        </p>
      )}

      <div className="stagger mt-8 space-y-5">
        {written.map((line) => (
          <div key={line.key} className="glass edge-lit rounded-[20px] p-5">
            <Eyebrow tone="gold">{line.label}</Eyebrow>
            {editingKey === line.key ? (
              <div className="print-hide mt-3 space-y-3">
                <textarea
                  value={draft}
                  rows={3}
                  maxLength={line.key === "identity" ? 280 : 1000}
                  autoFocus
                  onChange={(event) => setDraft(event.target.value)}
                  aria-label={line.label}
                  className="min-h-24 w-full resize-none rounded-[14px] border border-[var(--line)] bg-[rgba(18,23,34,.6)] px-4 py-3 text-[17px] leading-relaxed text-ink-0 outline-none focus:border-[var(--gold-500)]"
                />
                <Button
                  loading={pending}
                  onClick={() => void saveLine(line)}
                >
                  SAVE
                </Button>
                <Button variant="ghost" onClick={() => setEditingKey(null)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <button
                key={line.value}
                type="button"
                onClick={() => {
                  setDraft(line.value ?? "");
                  setEditingKey(line.key);
                }}
                className="mt-2 block w-full text-left"
              >
                <span className="text-[19px] leading-snug text-ink-0">
                  {line.value}
                </span>
              </button>
            )}
          </div>
        ))}
      </div>

      {unwritten.length > 0 && (
        <p className="mt-6 text-[15px] leading-relaxed text-ink-2">
          {written.length === 0 ? "Your code writes itself" : "The rest fills in"}{" "}
          as you complete{" "}
          {unwritten.map((line, i) => (
            <span key={line.key}>
              {i > 0 && (i === unwritten.length - 1 ? " and " : ", ")}
              {line.source}
            </span>
          ))}
          .
        </p>
      )}

      <p className="print-hide mt-8 text-center text-[13px] text-ink-2">
        Tap a line to edit it.
      </p>

      {/* A code is lived between Missions too. This is the moment he's
          reading what he stands for — point him at the way to act on it
          any day, not just the thirty. Never printed. */}
      <Link
        href="/action/declare"
        onClick={() => track("personal_code_one_off_opened")}
        className="print-hide mt-8 block"
      >
        <div className="glass flex items-center gap-3 rounded-[14px] border-[rgba(201,166,72,.35)] px-4 py-4">
          <span className="min-w-0 flex-1">
            <span className="eyebrow block text-gold-300">LIVE IT EVERY DAY</span>
            <span className="mt-1.5 block text-[15px] leading-snug text-ink-1">
              Your code isn&apos;t just for the 30 Missions. Log a One-Off
              Action any time you live it.
            </span>
          </span>
          <ChevronRight aria-hidden size={20} className="shrink-0 text-ink-2" />
        </div>
      </Link>
    </main>
  );
}
