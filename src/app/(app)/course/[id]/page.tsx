"use client";

import { ArrowUpRight, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState, type ReactNode } from "react";
import NavAction from "@/components/NavAction";
import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import Headline from "@/components/ui/Headline";
import Spinner from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { getLesson, moduleOf, nextLesson } from "@/content/course";
import { TRIGGERS } from "@/content/triggers";
import { store, useAppData } from "@/lib/data/store";
import { cn } from "@/lib/utils";

/** Button's look, on an anchor — links must stay links. */
const BUTTON_BASE =
  "relative inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-[14px] px-5 text-center text-[15px] font-semibold tracking-[0.08em] transition-opacity duration-200";

/**
 * `content/course.ts` writes lesson bodies as plain lines: `## …` is a
 * sub-heading, `- …` is a bullet, everything else is a paragraph. Consecutive
 * bullets become one list.
 */
function LessonBody({ body }: { body: string[] }) {
  const blocks: ReactNode[] = [];
  let bullets: string[] = [];

  function flushBullets() {
    if (bullets.length === 0) return;
    blocks.push(
      <ul
        key={`list-${blocks.length}`}
        className="mt-4 space-y-2 pl-5 text-[17px] leading-relaxed text-ink-1"
      >
        {bullets.map((item) => (
          <li key={item} className="list-disc marker:text-[var(--gold-500)]">
            {item}
          </li>
        ))}
      </ul>,
    );
    bullets = [];
  }

  for (const line of body) {
    if (line.startsWith("- ")) {
      bullets.push(line.slice(2));
      continue;
    }
    flushBullets();
    if (line.startsWith("## ")) {
      blocks.push(
        <p
          key={`h-${blocks.length}`}
          className="eyebrow mt-8 text-gold-300 first:mt-0"
        >
          {line.slice(3)}
        </p>,
      );
    } else {
      blocks.push(
        <p
          key={`p-${blocks.length}`}
          className="mt-4 text-[17px] leading-relaxed text-ink-1 first:mt-0"
        >
          {line}
        </p>,
      );
    }
  }
  flushBullets();

  return <div className="mt-6">{blocks}</div>;
}

export default function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { showToast } = useToast();
  const { courseProgress, error, refresh } = useAppData();
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

  if (!lesson || !courseProgress) {
    return (
      <main className="flex flex-1 items-center justify-center text-ink-2">
        <Spinner />
      </main>
    );
  }

  const parentModule = moduleOf(lesson);
  const next = nextLesson(lesson.id);
  const done = courseProgress.some((row) => row.lesson_id === lesson.id);

  const academyLink = (
    <a
      href={lesson.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        BUTTON_BASE,
        lesson.body
          ? "glass text-ink-0"
          : "bg-gold-gradient text-[#07090D] shadow-[inset_0_1px_0_rgba(255,255,255,.35),0_8px_24px_rgba(201,166,72,.18)]",
      )}
    >
      OPEN ON THE ACADEMY
      <ArrowUpRight aria-hidden size={18} />
    </a>
  );

  return (
    <main className="pt-2">
      <NavAction kind="back" href="/course" />

      <div className="mt-6">
        <Eyebrow>
          MODULE {lesson.module} · LESSON {lesson.order}
        </Eyebrow>
        <Headline level={2} className="mt-3">
          {lesson.title}
        </Headline>
      </div>

      {lesson.body ? (
        <LessonBody body={lesson.body} />
      ) : (
        <div className="glass mt-6 rounded-[20px] p-5">
          <p className="text-[17px] leading-relaxed text-ink-1">
            This lesson lives on the Mission Fragrances Academy. Open it there,
            then come back and mark it complete.
          </p>
        </div>
      )}

      <div className="mt-8 space-y-3">
        {academyLink}

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

        {lesson.trigger && (
          <Button
            variant="secondary"
            onClick={() =>
              router.push(`/mission/declare?trigger=${lesson.trigger}`)
            }
          >
            START A {TRIGGERS[lesson.trigger].name} MISSION
          </Button>
        )}

        {next && (
          <Link
            href={`/course/${next.id}`}
            className={cn(BUTTON_BASE, "min-h-12 text-ink-1")}
          >
            Next lesson →
          </Link>
        )}
      </div>

      {parentModule && (
        <p className="mt-6 text-center text-[13px] text-ink-2">
          Module {parentModule.number} · {parentModule.title}
        </p>
      )}
    </main>
  );
}
