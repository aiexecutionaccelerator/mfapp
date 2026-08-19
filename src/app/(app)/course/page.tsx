"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import Eyebrow, { AccentDot } from "@/components/ui/Eyebrow";
import Headline from "@/components/ui/Headline";
import Spinner from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { LESSON_COUNT, MODULES, type Lesson } from "@/content/course";
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
        <span className="font-display w-6 shrink-0 text-[20px] leading-none text-gold-300">
          {lesson.order}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[17px] leading-snug text-ink-0">
            {lesson.title}
          </span>
          {lesson.trigger && (
            <span className="mt-1.5 flex items-center gap-2 text-[13px] text-ink-2">
              <AccentDot trigger={lesson.trigger} />
              <span>{lesson.trigger.toUpperCase()}</span>
            </span>
          )}
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

  return (
    <main className="pt-4">
      <Headline>THE COURSE</Headline>
      <p className="mt-4 text-[15px] leading-relaxed text-ink-1">
        The Mission Fragrances Academy, lesson by lesson. Watch on the Academy,
        then mark it complete here.
      </p>
      <p className="mt-3 text-[13px] text-ink-2">
        {done.size} of {LESSON_COUNT} complete · {done.size} Course Reps
      </p>

      {MODULES.map((module) => (
        <section key={module.number} className="mt-8">
          <Eyebrow>MODULE {module.number}</Eyebrow>
          <h2 className="font-display mt-2 text-[22px] leading-tight text-ink-0 uppercase">
            {module.title}
          </h2>
          <div className="mt-4 space-y-3">
            {module.lessons.map((lesson) => (
              <LessonRow
                key={lesson.id}
                lesson={lesson}
                done={done.has(lesson.id)}
              />
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
