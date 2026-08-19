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
import GlassCard from "@/components/ui/GlassCard";
import Headline from "@/components/ui/Headline";
import Spinner from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { getLesson, nextLesson } from "@/content/course";
import { store, useAppData } from "@/lib/data/store";

const TODAYS_MISSION =
  "Wear your Scent Trigger and take one small courageous action to honor your commitment to being your best self.";

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

  if (!lesson || !courseProgress || !lessonResponses) {
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

  const missionHref = lesson.trigger
    ? `/mission/declare?trigger=${lesson.trigger}&day=${lesson.day}`
    : "/home";

  return (
    <main className="pt-2">
      <NavAction kind="back" href="/course" />

      <div className="mt-6">
        <Eyebrow>
          DAY {lesson.day} · MODULE {lesson.module}
        </Eyebrow>
        <Headline level={2} className="mt-3">
          {lesson.title}
        </Headline>
      </div>

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

      <GlassCard className="mt-10">
        <Eyebrow tone="gold">TODAY&apos;S MISSION</Eyebrow>
        <p className="mt-3 text-[17px] leading-relaxed text-ink-0">
          {TODAYS_MISSION}
        </p>
        <div className="mt-5">
          <Link href={missionHref} className="block">
            <Button variant="secondary">START A MISSION</Button>
          </Link>
        </div>
      </GlassCard>

      <div className="mt-8 space-y-3">
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

        {next && (
          <Link
            href={`/course/${next.id}`}
            className="flex min-h-12 w-full items-center justify-center text-[15px] font-semibold tracking-[0.08em] text-ink-1"
          >
            Next lesson →
          </Link>
        )}
      </div>

      <p className="mt-6 text-center text-[13px] text-ink-2">
        Module {lesson.module} · {lesson.moduleTitle}
      </p>
    </main>
  );
}
