"use client";

import { Printer } from "lucide-react";
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
import { compilePersonalCode } from "@/lib/personalCode";

/**
 * My Personal Code — one page, printable with the browser's own print. Each
 * line is edited in place and written back to its source (the identity
 * statement on the profile, the rest to Mission answers), so the code, the
 * Missions, and Settings never disagree.
 */
export default function PersonalCodePage() {
  const { showToast } = useToast();
  const { profile, lessonResponses, error, refresh } = useAppData();

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

  if (!profile || !lessonResponses) {
    return (
      <main className="flex flex-1 items-center justify-center text-ink-2">
        <Spinner />
      </main>
    );
  }

  const lines = compilePersonalCode(profile, lessonResponses);

  async function saveLine(key: string, slug: string | null) {
    setPending(true);
    const value = draft.trim();
    try {
      if (slug) await store.saveLessonResponse(slug, "q", value);
      // The identity line is also the profile field Settings shows.
      if (key === "identity") {
        await store.updateProfile({ identity_statement: value || null });
      }
      track("personal_code_edited", { line: key });
      setEditingKey(null);
    } catch {
      showToast("Couldn't save that. Please try again.");
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

      <div className="mt-8 space-y-5">
        {lines.map((line) => (
          <div key={line.key} className="glass rounded-[20px] p-5">
            <Eyebrow tone="gold">{line.label}</Eyebrow>
            {editingKey === line.key ? (
              <div className="print-hide mt-3 space-y-3">
                <textarea
                  value={draft}
                  rows={3}
                  maxLength={500}
                  autoFocus
                  onChange={(event) => setDraft(event.target.value)}
                  aria-label={line.label}
                  className="min-h-24 w-full resize-none rounded-[14px] border border-[var(--line)] bg-[rgba(18,23,34,.6)] px-4 py-3 text-[17px] leading-relaxed text-ink-0 outline-none focus:border-[var(--gold-500)]"
                />
                <Button
                  loading={pending}
                  onClick={() => void saveLine(line.key, line.slug)}
                >
                  SAVE
                </Button>
                <Button variant="ghost" onClick={() => setEditingKey(null)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setDraft(line.value ?? "");
                  setEditingKey(line.key);
                }}
                className="mt-2 block w-full text-left"
              >
                {line.value ? (
                  <span className="text-[19px] leading-snug text-ink-0">
                    {line.value}
                  </span>
                ) : (
                  <span className="text-[15px] text-ink-2">
                    Not written yet — answer this in {line.source}, or tap to
                    write it now.
                  </span>
                )}
              </button>
            )}
          </div>
        ))}
      </div>

      <p className="print-hide mt-8 text-center text-[13px] text-ink-2">
        Tap any line to edit it. Printing uses your browser&apos;s print dialog —
        nothing to install.
      </p>
    </main>
  );
}
