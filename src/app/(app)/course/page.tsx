"use client";

import { Check, Lock } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import Button from "@/components/ui/Button";
import Eyebrow, { AccentDot } from "@/components/ui/Eyebrow";
import GlassCard from "@/components/ui/GlassCard";
import Headline from "@/components/ui/Headline";
import Spinner from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import {
  LESSONS,
  LESSON_COUNT,
  MODULES,
  firstIncompleteLesson,
  isLessonUnlocked,
} from "@/content/course";
import type { Lesson } from "@/content/course";
import { useAppData } from "@/lib/data/store";
import { cn } from "@/lib/utils";

function RowBody({ lesson, locked }: { lesson: Lesson; locked: boolean }) {
  return (
    <span className="min-w-0 flex-1">
      <span className="eyebrow block text-gold-300">DAY {lesson.day}</span>
      <span
        className={cn(
          "mt-1.5 block text-[17px] leading-snug",
          locked ? "text-ink-2" : "text-ink-0",
        )}
      >
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
  );
}

const ROW_CLASS = "glass flex items-center gap-3 rounded-[14px] px-4 py-4";

function LessonRow({
  lesson,
  done,
  locked,
}: {
  lesson: Lesson;
  done: boolean;
  locked: boolean;
}) {
  const { showToast } = useToast();

  if (locked) {
    return (
      <button
        type="button"
        className={cn(ROW_CLASS, "w-full text-left")}
        onClick={() => showToast("Complete the previous lesson first.")}
      >
        <RowBody lesson={lesson} locked />
        <Lock aria-label="Locked" size={18} className="shrink-0 text-ink-2" />
      </button>
    );
  }

  return (
    <Link href={`/course/${lesson.id}`} className="block">
      <div className={cn(ROW_CLASS, done && "border-[rgba(201,166,72,.35)]")}>
        <RowBody lesson={lesson} locked={false} />
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
  const { courseProgress, error, refresh } = useAppData();

  useEffect(() => {
    if (!error) return;
    showToast("Couldn't load the course.", { retry: () => void refresh() });
  }, [error, refresh, showToast]);

  if (!courseProgress) {
    return (
      <main className="flex flex-1 items-center justify-center text-ink-2">
        <Spinner />
      </main>
    );
  }

  const done = new Set(courseProgress.map((row) => row.lesson_id));
  // Next up follows the work done, not the calendar.
  const next = firstIncompleteLesson(done);

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
        {next ? (
          <>
            <Eyebrow tone="gold">NEXT UP</Eyebrow>
            <p className="mt-2 text-[17px] leading-snug text-ink-0">
              DAY {next.day} · {next.title}
            </p>
            {next.minutes !== null && (
              <p className="mt-2 text-[13px] text-ink-2">{next.minutes} min</p>
            )}
            <Link href={`/course/${next.id}`} className="mt-5 block">
              <Button>OPEN LESSON</Button>
            </Link>
          </>
        ) : (
          <>
            <Eyebrow tone="gold">COURSE COMPLETE</Eyebrow>
            <p className="mt-2 text-[17px] leading-relaxed text-ink-1">
              All 30 lessons done.
            </p>
            <Link href="/course/vivid-vision" className="mt-5 block">
              <Button>OPEN MY VIVID VISION</Button>
            </Link>
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
                  locked={!isLessonUnlocked(lesson.id, done)}
                />
              ),
            )}
          </div>
        </section>
      ))}
    </main>
  );
}
