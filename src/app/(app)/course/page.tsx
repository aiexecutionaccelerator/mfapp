"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import Button from "@/components/ui/Button";
import Eyebrow, { AccentDot } from "@/components/ui/Eyebrow";
import GlassCard from "@/components/ui/GlassCard";
import Headline from "@/components/ui/Headline";
import Spinner from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { LESSONS, LESSON_COUNT, MODULES, lessonForDay } from "@/content/course";
import type { Lesson } from "@/content/course";
import { challengeDay, getMode } from "@/lib/challenge";
import { useAppData } from "@/lib/data/store";
import { cn } from "@/lib/utils";

function LessonRow({ lesson, done }: { lesson: Lesson; done: boolean }) {
  return (
    <Link href={`/course/${lesson.id}`} className="block">
      <div
        className={cn(
          "glass flex items-center gap-3 rounded-[14px] px-4 py-4",
          done && "border-[rgba(201,166,72,.35)]",
        )}
      >
        <span className="min-w-0 flex-1">
          <span className="eyebrow block text-gold-300">DAY {lesson.day}</span>
          <span className="mt-1.5 block text-[17px] leading-snug text-ink-0">
            {lesson.title}
          </span>
          <span className="mt-1.5 flex items-center gap-3 text-[13px] text-ink-2">
            {lesson.minutes !== null && <span>{lesson.minutes} min</span>}
            {lesson.trigger && (
              <span className="flex items-center gap-2">
                <AccentDot trigger={lesson.trigger} />
                <span>{lesson.trigger.toUpperCase()}</span>
              </span>
            )}
          </span>
        </span>
        {done && (
          <Check
            aria-label="Completed"
            size={20}
            className="shrink-0 text-gold-300"
          />
        )}
      </div>
    </Link>
  );
}

export default function CoursePage() {
  const { showToast } = useToast();
  const { profile, courseProgress, error, refresh } = useAppData();

  useEffect(() => {
    if (!error) return;
    showToast("Couldn't load the course.", { retry: () => void refresh() });
  }, [error, refresh, showToast]);

  if (!profile || !courseProgress) {
    return (
      <main className="flex flex-1 items-center justify-center text-ink-2">
        <Spinner />
      </main>
    );
  }

  const done = new Set(courseProgress.map((row) => row.lesson_id));
  const day = challengeDay(profile);
  // Only while the 30 days are running; after that every lesson is equal.
  const today =
    getMode(profile) === "challenge" ? lessonForDay(day) : undefined;

  return (
    <main className="pt-4">
      <Headline>THE COURSE</Headline>
      <p className="mt-4 text-[15px] leading-relaxed text-ink-1">
        One lesson a day for 30 days. Watch, reflect, then take today&apos;s
        Mission.
      </p>
      <p className="mt-3 text-[13px] text-ink-2">
        {done.size} of {LESSON_COUNT} complete · {done.size} Course Reps
      </p>

      <GlassCard className="mt-6 border-[rgba(201,166,72,.35)]">
        {today ? (
          <>
            <Eyebrow tone="gold">
              DAY {today.day} · {today.title}
            </Eyebrow>
            {today.minutes !== null && (
              <p className="mt-2 text-[13px] text-ink-2">{today.minutes} min</p>
            )}
            <Link href={`/course/${today.id}`} className="mt-5 block">
              <Button>OPEN TODAY&apos;S LESSON</Button>
            </Link>
          </>
        ) : (
          <>
            <Eyebrow tone="gold">PICK ANY LESSON</Eyebrow>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-1">
              The 30 days are behind you. Every lesson stays open — come back to
              any of them, any time.
            </p>
          </>
        )}
      </GlassCard>

      {MODULES.map((module) => (
        <section key={module.number} className="mt-8">
          <Eyebrow>MODULE {module.number}</Eyebrow>
          <h2 className="font-display mt-2 text-[22px] leading-tight text-ink-0 uppercase">
            {module.title}
          </h2>
          <div className="mt-4 space-y-3">
            {LESSONS.filter((lesson) => lesson.module === module.number).map(
              (lesson) => (
                <LessonRow
                  key={lesson.id}
                  lesson={lesson}
                  done={done.has(lesson.id)}
                />
              ),
            )}
          </div>
        </section>
      ))}
    </main>
  );
}
