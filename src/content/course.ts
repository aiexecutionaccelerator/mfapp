import type { Trigger } from "@/lib/data/types";

/**
 * The Mission Fragrances Academy, mirrored as a guided index.
 *
 * The lessons themselves live on the Academy behind a login, so this app is the
 * map and the record: it lists every lesson, links out to it, and tracks what
 * you have finished. The three core-values lessons carry their text in `body`
 * so a man can read them without leaving a Mission.
 *
 * `body` is a small line format so the copy stays here and the screen stays
 * dumb:
 *   `## Heading`  → sub-heading (small gold eyebrow)
 *   `- item`      → bullet; consecutive bullets render as one list
 *   anything else → paragraph
 *
 * `points` is display-only metadata carried over from the Academy. There is no
 * points economy in this app — the only count that matters is Course Reps.
 */

export const ACADEMY_URL =
  "https://www.missionfragrancesacademy.com/mf-academy/all-trainings/";

const BASE = "https://www.missionfragrancesacademy.com/mf-academy";

export interface Lesson {
  id: string;
  module: number;
  order: number;
  title: string;
  url: string;
  points: number;
  trigger: Trigger | null;
  body: string[] | null;
}

export interface Module {
  number: number;
  title: string;
  lessons: Lesson[];
}

const HONOR_BODY: string[] = [
  "I named the three Scent Triggers after the core values of the United States Marine Corps: Honor, Courage, Commitment. I didn't pick them because they sound good on a bottle. I picked them because they are the shortest, hardest-earned description of what it takes to be a man other men can rely on.",
  "We start with Honor, because the other two are worth very little without it.",
  "## What Is Honor?",
  "Honor is your moral compass. It is not a title, a rank, or a reputation — it cannot be handed to you by anyone else. It is cultivated from within, and it is measured not by recognition but by the quiet satisfaction of having acted in line with your principles when it would have been easier not to.",
  "## Honor Is a Gift a Man Gives Himself",
  'In the film Rob Roy, a father tells his sons that "honour is a gift a man gives himself." That line is the whole lesson. Nobody awards it to you. Nobody can take it from you either. You give it to yourself, one decision at a time, and you are the only one keeping an accurate count.',
  "## Why Is Honor Important?",
  "Because everything you build rests on it. Your word is the only currency that works with everyone — your family, your team, your customers, and yourself. A man whose word means something can be trusted with responsibility, and responsibility is where a life gets its weight.",
  "And there is a private cost to living without it. You can fool other people for a long time. You cannot fool the man in the mirror at the end of the day.",
  "## Cultivating Honor",
  "Honor is not a feeling. It is a practice, and it is built out of ordinary decisions:",
  "- Be true to your word — do what you said you would do, when you said you would do it.",
  "- Stand up for what you believe in, even when the room disagrees.",
  "- Take responsibility for your actions — own the mistake before anyone else names it.",
  "- Maintain your standards in the face of adversity, especially when nobody is watching.",
  "Start with one of those today. Apply Honor, declare the action, and go do it.",
];

const COURAGE_BODY: string[] = [
  "What is courage? Is it about becoming a hero in a moment of crisis? Perhaps. But in reality, courage is much more than that. It's about the decisions we make daily and the attitude we carry throughout life.",
  "## Where Does Courage Come From?",
  "Courage isn't something that just happens. It's not a switch you flip when you're in danger. A man's courage comes from the mental, moral, and physical strength ingrained within him through hard work and the practice of mastering his fear. It should aim to do what is right, adhere to a higher standard of personal conduct, and lead by example — sometimes making tough decisions under stress and pressure.",
  "## Understanding Courage",
  "It's easy to imagine running out onto the battlefield to save your buddies or single-handedly taking out an enemy position when guys think of courage. These things happen — but quite frankly, it's unlikely to happen to you as you go about your day-to-day life. Not all acts of courage need to be huge and audacious to be defined as brave. Sticking to a plan when you know things could go wrong — that's brave. Facing your fear of heights and climbing a ladder to fix a gutter pipe — that's also brave. These may seem like small steps, but they require an inner strength that is truly admirable.",
  "## Daily Acts of Courage",
  'Getting down to the basics — courage could be something as simple as saying "no" to an event you don\'t want to attend. Let\'s be clear — you won\'t win any medals for this, but the principle is the same. You\'ve overcome a fear that was holding you back, and that, gentlemen, is what I call a courageous success. Every act of courage contributes to building a courageous personality, no matter how small it seems. It\'s about facing your fears and overcoming them one day at a time.',
];

const COMMITMENT_BODY: string[] = [
  "I can guarantee that every man has shown at least some commitment during his adult life. In short, commitment is the spirit of determination and dedication that leads to the mastery of self. Its purpose is to promote the highest order of discipline and is the ingredient that instills dedication to our life's purpose.",
  "## What Is Commitment?",
  "Commitment is more than just a promise or a vow. It's a conscious decision to stick to a goal or a task, even in the face of adversity. It's about pushing through, despite obstacles and setbacks, to fulfill an obligation we've made to ourselves or others.",
  "## Where Does Commitment Come From?",
  "Commitment doesn't spring up from anywhere. It doesn't come and go with our moods. It's born from a mental and emotional determination, fortified through discipline, self-control, and the mastery of our doubts and fears. It's about standing by our principles and values and sometimes making challenging decisions under stress and pressure.",
  "## Understanding Commitment",
  "I hear you, gents. Not every man wants the commitment of getting married, settling down, and having a few kids. I did it, and I think it's great — but I know it's not for everyone, and each man has to forge his own path. So, don't worry, I'm not suggesting you get down on one knee and ask your girl to marry you tomorrow. Commitment might seem daunting when considering significant life commitments, such as relationships, careers, or personal development goals. However, commitment starts small. It's about making daily decisions that align with our objectives, like choosing to hit the gym instead of sleeping in or opting for a healthier meal over fast food. These might seem like insignificant choices, but they reinforce our commitment and build our capacity to stay dedicated to larger, more challenging goals.",
  "## Daily Acts of Commitment",
  "Commitment is interwoven into the fabric of our daily lives. It could be as simple as sticking to your plan to meditate every morning or making plans with your buddies and seeing them through to the end. No matter how small, each act of commitment contributes to building a resilient and determined character.",
];

interface RawLesson {
  title: string;
  slug: string;
  points: number;
  trigger?: Trigger;
  body?: string[];
}

interface RawModule {
  number: number;
  title: string;
  /** Path under `BASE` that every lesson slug hangs off. */
  path: string;
  lessons: RawLesson[];
}

const RAW_MODULES: RawModule[] = [
  {
    number: 1,
    title: "Quick Start",
    path: "module-1-quick-start",
    lessons: [
      { title: "Welcome & Get Started", slug: "welcome", points: 5 },
      { title: "Mission Fragrances Set Overview", slug: "mf-set", points: 10 },
      { title: "S.T.A.R. System", slug: "star-system-in-detail", points: 10 },
      {
        title: "30 Day Mission Fragrance Challenge",
        slug: "30-day-mission-fragrance-challenge",
        points: 5,
      },
      { title: "Mindset To Succeed", slug: "mindset-to-succeed", points: 15 },
    ],
  },
  {
    number: 2,
    title: "Legacy & Core Values",
    path: "module-2-legacy-and-core-values",
    lessons: [
      { title: "Your Legacy", slug: "legacy", points: 30 },
      {
        title: "The Importance Of Honor",
        slug: "the-importance-of-honor",
        points: 20,
        trigger: "honor",
        body: HONOR_BODY,
      },
      {
        title: "The Need For Courage",
        slug: "the-need-for-courage",
        points: 20,
        trigger: "courage",
        body: COURAGE_BODY,
      },
      {
        title: "The Power Of Commitment",
        slug: "the-power-of-commitment",
        points: 20,
        trigger: "commitment",
        body: COMMITMENT_BODY,
      },
      {
        title: "Shrine To Self-Improvement",
        slug: "self-improvement-shrine",
        points: 15,
      },
    ],
  },
  {
    number: 3,
    title: "Defining The Man You Know Yourself To Be",
    path: "defining-the-man-you-know-yourself-to-be",
    lessons: [
      { title: "Why You Need A Vision", slug: "why-you-need-a-vision", points: 30 },
      { title: "Your Reputation", slug: "your-reputation", points: 45 },
      { title: "Relationships", slug: "relationships", points: 45 },
      { title: "Career & Business", slug: "career-business", points: 45 },
      { title: "Health", slug: "health", points: 45 },
      { title: "Wealth", slug: "wealth", points: 45 },
      { title: "Lifestyle", slug: "lifestyle", points: 45 },
      // The trailing hyphen in this slug is the Academy's, not a typo.
      {
        title: "Social Impact & Your Legacy",
        slug: "social-impact-legacy-",
        points: 45,
      },
    ],
  },
  {
    number: 4,
    title: "Laws Of M.W.G.S.D (Men Who Get Sh*t Done)",
    path: "laws-of-mwgsd-men-who-get-sht-done",
    lessons: [
      {
        title: "Mindset for Achieving Your Vivid Vision",
        slug: "mindset",
        points: 10,
      },
      { title: "Pareto Principle", slug: "pareto-principle", points: 15 },
      { title: "Essentialism", slug: "essentialism", points: 15 },
      { title: "1% Better Daily", slug: "1-percent-better-daily", points: 20 },
      {
        title: "Doing Nothing vs. Doing One Thing",
        slug: "doing-nothing-vs-doing-one-thing",
        points: 15,
      },
      { title: "Latent Potential", slug: "latent-potential", points: 15 },
      {
        title: "Identity-Based Decision Making",
        slug: "identity-based-decision-making",
        points: 15,
      },
      { title: "SMART Goals", slug: "smart-goals", points: 20 },
    ],
  },
  {
    number: 5,
    title: "Forge Your Vivid Vision",
    path: "forge-your-vivid-vision",
    lessons: [
      { title: "Review", slug: "review", points: 20 },
      { title: "Frame", slug: "share-copy", points: 20 },
      { title: "Broadcast", slug: "share", points: 55 },
    ],
  },
];

export const MODULES: Module[] = RAW_MODULES.map((module) => ({
  number: module.number,
  title: module.title,
  lessons: module.lessons.map((lesson, index) => ({
    id: lesson.slug,
    module: module.number,
    order: index + 1,
    title: lesson.title,
    url: `${BASE}/${module.path}/${lesson.slug}/`,
    points: lesson.points,
    trigger: lesson.trigger ?? null,
    body: lesson.body ?? null,
  })),
}));

/** Every lesson, in course order. */
export const LESSONS: Lesson[] = MODULES.flatMap((module) => module.lessons);

export const LESSON_COUNT = LESSONS.length;

export function getLesson(id: string): Lesson | null {
  return LESSONS.find((lesson) => lesson.id === id) ?? null;
}

export function moduleOf(lesson: Lesson): Module | null {
  return MODULES.find((module) => module.number === lesson.module) ?? null;
}

/** The next lesson in course order, crossing module boundaries. */
export function nextLesson(id: string): Lesson | null {
  const index = LESSONS.findIndex((lesson) => lesson.id === id);
  if (index === -1 || index === LESSONS.length - 1) return null;
  return LESSONS[index + 1];
}
