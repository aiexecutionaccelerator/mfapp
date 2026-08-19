"use client";

import { addYears, format } from "date-fns";
import { CalendarPlus, Mail, Pencil, Printer, Share2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import NavAction from "@/components/NavAction";
import PromptField from "@/components/course/PromptField";
import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import GlassCard from "@/components/ui/GlassCard";
import Headline from "@/components/ui/Headline";
import Spinner from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { LESSONS } from "@/content/course";
import type { Lesson, VisionSection } from "@/content/course";
import { useAppData } from "@/lib/data/store";

const SECTION_TITLES: Record<VisionSection, string> = {
  reputation: "Reputation",
  relationships: "Relationships",
  career: "Career & Business",
  health: "Health",
  wealth: "Wealth",
  lifestyle: "Lifestyle",
  legacy: "Social Impact & Legacy",
  smart: "S.M.A.R.T. Goal",
};

const PART_TITLES = ["In three years…", "Steps", "Obstacles"];

/** Days 12–18, then the SMART goal from Day 26 — in Vivid Vision order. */
const SECTIONS: Lesson[] = LESSONS.filter((lesson) => lesson.visionSection);

const VISION_EMAIL = "antonio@missionfragrances.com";

/** Mail clients start truncating long mailto bodies; keep well under it. */
const MAILTO_MAX = 4000;

function compile(
  answers: Map<string, string>,
  name: string,
): { text: string; empty: boolean } {
  const lines: string[] = [`${name.toUpperCase()}'S VIVID VISION`, ""];
  let empty = true;

  for (const lesson of SECTIONS) {
    const section = lesson.visionSection as VisionSection;
    const parts = lesson.prompts
      .slice(0, section === "smart" ? 1 : 3)
      .map((prompt) => answers.get(prompt.id)?.trim() ?? "");
    if (parts.every((part) => !part)) continue;
    empty = false;
    lines.push(SECTION_TITLES[section].toUpperCase());
    parts.forEach((part, index) => {
      if (!part) return;
      if (section !== "smart") lines.push(PART_TITLES[index]);
      lines.push(part, "");
    });
  }

  return { text: lines.join("\n").trim(), empty };
}

function downloadReviewInvite(): void {
  const date = addYears(new Date(), 3);
  const stamp = format(date, "yyyyMMdd");
  const dayAfter = new Date(date);
  dayAfter.setDate(dayAfter.getDate() + 1);

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Mission Fragrances//Mission//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:vivid-vision-${stamp}@missionfragrances.com`,
    `DTSTAMP:${format(new Date(), "yyyyMMdd'T'HHmmss")}`,
    `DTSTART;VALUE=DATE:${stamp}`,
    `DTEND;VALUE=DATE:${format(dayAfter, "yyyyMMdd")}`,
    "SUMMARY:Review my Vivid Vision",
    "DESCRIPTION:Three years on. Read what you wrote and measure yourself against it.",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const url = URL.createObjectURL(
    new Blob([ics], { type: "text/calendar;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "vivid-vision-review.ics";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function Section({
  lesson,
  answers,
}: {
  lesson: Lesson;
  answers: Map<string, string>;
}) {
  const [editing, setEditing] = useState(false);
  const section = lesson.visionSection as VisionSection;
  const prompts = lesson.prompts.slice(0, section === "smart" ? 1 : 3);
  const written = prompts.some((prompt) => (answers.get(prompt.id) ?? "").trim());

  return (
    <section className="mt-8">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-[24px] leading-tight text-ink-0 uppercase">
          {SECTION_TITLES[section]}
        </h2>
        <button
          type="button"
          onClick={() => setEditing(!editing)}
          className="print-hide flex min-h-12 items-center gap-2 text-[13px] text-gold-300"
        >
          <Pencil aria-hidden size={14} />
          {editing ? "Done" : "Edit"}
        </button>
      </div>

      {editing ? (
        <div className="mt-4 space-y-6">
          {prompts.map((prompt) => (
            <PromptField
              key={prompt.id}
              lessonId={lesson.id}
              prompt={prompt}
              saved={answers.get(prompt.id) ?? null}
            />
          ))}
        </div>
      ) : written ? (
        <div className="mt-4 space-y-5">
          {prompts.map((prompt, index) => {
            const answer = (answers.get(prompt.id) ?? "").trim();
            if (!answer) return null;
            return (
              <div key={prompt.id}>
                {section !== "smart" && (
                  <p className="eyebrow text-ink-2">{PART_TITLES[index]}</p>
                )}
                <p className="mt-2 text-[17px] leading-relaxed whitespace-pre-line text-ink-0">
                  {answer}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <Link
          href={`/course/${lesson.id}`}
          className="print-hide mt-3 flex min-h-12 items-center text-[15px] text-ink-2"
        >
          Not written yet — Day {lesson.day} →
        </Link>
      )}
    </section>
  );
}

export default function VividVisionPage() {
  const { showToast } = useToast();
  const { profile, lessonResponses, error, refresh } = useAppData();

  useEffect(() => {
    if (!error) return;
    showToast("Couldn't load your Vivid Vision.", {
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

  const firstName = profile.display_name?.trim().split(/\s+/)[0] ?? "";
  const answers = new Map(
    lessonResponses.map((row) => [row.prompt_id, row.answer]),
  );
  const { text, empty } = compile(answers, firstName || "My");

  function sendToAntonio() {
    const subject = `My Vivid Vision — ${firstName || "Mission member"}`;
    window.location.assign(
      `mailto:${VISION_EMAIL}?subject=${encodeURIComponent(
        subject,
      )}&body=${encodeURIComponent(text.slice(0, MAILTO_MAX))}`,
    );
  }

  async function share() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "My Vivid Vision", text });
        return;
      } catch {
        return; // cancelled — nothing to report
      }
    }
    window.location.assign(
      `mailto:?subject=${encodeURIComponent(
        "My Vivid Vision",
      )}&body=${encodeURIComponent(text.slice(0, MAILTO_MAX))}`,
    );
  }

  return (
    <main className="print-page pt-2">
      <div className="print-hide">
        <NavAction kind="back" href="/course" />
      </div>

      {/* Printed header — the page it becomes on paper. */}
      <div className="mt-6 hidden print:block">
        <p className="font-display text-[22px] tracking-[0.14em] uppercase">
          Mission
        </p>
        <p className="text-[13px]">{format(new Date(), "MMMM d, yyyy")}</p>
      </div>

      <Eyebrow tone="gold" className="mt-6 print:hidden">
        THREE YEARS FROM NOW
      </Eyebrow>
      <Headline className="mt-3">
        {(firstName || "My").toUpperCase()}&apos;S VIVID VISION
      </Headline>

      {empty && (
        <GlassCard className="print-hide mt-6">
          <p className="text-[15px] leading-relaxed text-ink-1">
            Nothing here yet. Your Vivid Vision is built from what you write on
            Days 12 to 18 and your S.M.A.R.T. goal on Day 26 — start with any
            section below.
          </p>
        </GlassCard>
      )}

      {SECTIONS.map((lesson) => (
        <Section key={lesson.id} lesson={lesson} answers={answers} />
      ))}

      <div className="print-hide mt-12 space-y-3">
        <Button variant="secondary" onClick={() => window.print()}>
          <Printer aria-hidden size={18} />
          SAVE AS PDF / PRINT
        </Button>

        <Button variant="secondary" onClick={share}>
          <Share2 aria-hidden size={18} />
          SHARE MY VIVID VISION
        </Button>

        <Button variant="secondary" onClick={downloadReviewInvite}>
          <CalendarPlus aria-hidden size={18} />
          ADD 3-YEAR REVIEW TO CALENDAR
        </Button>

        <Button variant="secondary" onClick={sendToAntonio}>
          <Mail aria-hidden size={18} />
          SEND TO ANTONIO
        </Button>
        <p className="text-center text-[13px] text-ink-2">
          Optional. Antonio&apos;s team can refine it with you.
        </p>
      </div>
    </main>
  );
}
