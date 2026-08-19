"use client";

import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import NavAction from "@/components/NavAction";
import LessonBody from "@/components/course/LessonBody";
import LessonVideo from "@/components/course/LessonVideo";
import PromptField from "@/components/course/PromptField";
import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import Headline from "@/components/ui/Headline";
import Spinner from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { getLesson, isLessonUnlocked, nextLesson } from "@/content/course";
import { store, useAppData } from "@/lib/data/store";

export default function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { showToast } = useToast();
  const { courseProgress, lessonResponses, error, refresh } = useAppData();
  const [pending, setPending] = useState(false);

  const lesson = getLesson(id);

  useEffect(() => {
    if (!lesson) router.replace("/course");
  }, [lesson, router]);

  // The course runs in order — a lesson you haven't earned sends you back.
  const locked =
    lesson !== undefined &&
    courseProgress !== null &&
    !isLessonUnlocked(
      lesson.id,
      new Set(courseProgress.map((row) => row.lesson_id)),
    );

  useEffect(() => {
    if (!locked) return;
    showToast("Complete the previous lesson first.");
    router.replace("/course");
  }, [locked, router, showToast]);

  useEffect(() => {
    if (!error) return;
    showToast("Couldn't load the course.", { retry: () => void refresh() });
  }, [error, refresh, showToast]);

  async function markComplete() {
    if (!lesson) return;
    setPending(true);
    try {
      await store.completeLesson(lesson.id);
      showToast("Lesson complete. Course Rep +1.");
    } catch {
      showToast("Couldn't save your progress. Please try again.", {
        retry: () => void markComplete(),
      });
    } finally {
      setPending(false);
    }
  }

  if (!lesson || !courseProgress || !lessonResponses || locked) {
    return (
      <main className="flex flex-1 items-center justify-center text-ink-2">
        <Spinner />
      </main>
    );
  }

  const next = nextLesson(lesson.id);
  const done = courseProgress.some((row) => row.lesson_id === lesson.id);
  const answers = new Map(
    lessonResponses
      .filter((row) => row.lesson_id === lesson.id)
      .map((row) => [row.prompt_id, row.answer]),
  );

  return (
    <main className="pt-2">
      <NavAction kind="back" href="/course" />

      <Headline level={2} className="mt-6">
        {lesson.title}
      </Headline>

      {lesson.youtubeId && (
        <LessonVideo youtubeId={lesson.youtubeId} title={lesson.title} />
      )}

      <LessonBody body={lesson.body} />

      {lesson.prompts.length > 0 && (
        <section className="mt-10">
          <Eyebrow tone="gold">REFLECT</Eyebrow>
          <p className="mt-2 text-[13px] text-ink-2">
            Private. Only you ever see this.
          </p>
          <div className="mt-5 space-y-7">
            {lesson.prompts.map((prompt) => (
              <PromptField
                key={prompt.id}
                lessonId={lesson.id}
                prompt={prompt}
                saved={answers.get(prompt.id) ?? null}
              />
            ))}
          </div>
        </section>
      )}

      {lesson.visionSection && (
        <Link
          href="/course/vivid-vision"
          className="mt-6 flex min-h-12 items-center gap-2 text-[15px] text-gold-300"
        >
          View my Vivid Vision so far
          <ArrowRight aria-hidden size={16} />
        </Link>
      )}

      <div className="mt-10 space-y-3">
        {lesson.module === 5 && (
          <Link href="/course/vivid-vision" className="block">
            <Button variant="secondary">
              {lesson.day === 27 ? "BUILD MY VIVID VISION" : "OPEN MY VIVID VISION"}
            </Button>
          </Link>
        )}

        {done ? (
          <Button variant="secondary" aria-disabled className="opacity-60">
            <Check aria-hidden size={18} />
            Completed
          </Button>
        ) : (
          <Button loading={pending} onClick={markComplete}>
            MARK COMPLETE
          </Button>
        )}

        {/* The next lesson only opens once this one is done. */}
        {next &&
          (done ? (
            <Link href={`/course/${next.id}`} className="block">
              <Button variant="secondary">NEXT LESSON →</Button>
            </Link>
          ) : (
            <>
              <Button variant="secondary" disabled>
                NEXT LESSON →
              </Button>
              <p className="text-center text-[13px] text-ink-2">
                Mark this lesson complete to continue
              </p>
            </>
          ))}
      </div>

      <p className="mt-6 text-center text-[13px] text-ink-2">
        Module {lesson.module} · {lesson.moduleTitle}
      </p>
    </main>
  );
}
