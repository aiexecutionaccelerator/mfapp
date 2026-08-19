import type { Trigger } from "@/lib/data/types";

/**
 * The 30-Day Mission course — the whole thing, in the app.
 *
 * One lesson per day of the challenge. The text is Antonio's, lifted from the
 * classroom and cleaned of everything that pointed somewhere else: no points,
 * no community posts, no "email it to me". What the lessons used to ask a man
 * to post, he now writes here (`prompts`, stored privately as lesson
 * responses) or does (the Today's Mission hand-off on every lesson screen).
 *
 * `body` is markdown: `##` / `###` headings, `**bold**`, `- ` bullets,
 * `1. ` numbered lists, `![alt](src)`, `[text](url)`.
 *
 * Days 12–18 and 26 carry a `visionSection`: those answers compile into the
 * Vivid Vision page. Days 12–18 also carry Antonio's ten "one small courageous
 * action" ideas, which become Declare suggestions on that day.
 */

export type PromptKind = "text" | "commit" | "check";

export type VisionSection =
  | "reputation"
  | "relationships"
  | "career"
  | "health"
  | "wealth"
  | "lifestyle"
  | "legacy"
  | "smart";

export interface LessonPrompt {
  /** Stable across edits: `${lessonId}:${n}`. Never renumber a shipped prompt. */
  id: string;
  kind: PromptKind;
  label: string;
  placeholder?: string;
  minWords?: number;
}

export interface Lesson {
  /** 1–30 — the day of the challenge, and the order in the course. */
  day: number;
  id: string;
  module: number;
  moduleTitle: string;
  title: string;
  /** Unlisted YouTube video. Four lessons have none. */
  youtubeId: string | null;
  minutes: number | null;
  trigger: Trigger | null;
  body: string;
  prompts: LessonPrompt[];
  /** Antonio's inspiration list — offered on the Declare screen that day. */
  missionSuggestions?: string[];
  visionSection?: VisionSection;
}

export interface Module {
  number: number;
  title: string;
  days: [number, number];
}

export const MODULES: Module[] = [
  { number: 1, title: "Quick Start", days: [1, 5] },
  { number: 2, title: "Legacy & Core Values", days: [6, 10] },
  { number: 3, title: "The Man You Know Yourself To Be", days: [11, 18] },
  { number: 4, title: "Laws Of Men Who Get Sh*t Done", days: [19, 26] },
  { number: 5, title: "Forge Your Vivid Vision", days: [27, 30] },
];

export const LESSONS: Lesson[] = [
  {
    day: 1,
    id: "welcome-and-get-started",
    module: 1,
    moduleTitle: "Quick Start",
    title: "Welcome & Get Started",
    youtubeId: "p1VGPvExpx0",
    minutes: 2,
    trigger: null,
    prompts: [],
    body: `Welcome to your Mission. For the next 30 days you get one short lesson and one real-world Mission a day. The lessons teach the system behind Honor, Courage, and Commitment; the Missions are where it becomes real.

Watch the video, mark the lesson complete, then take today's Mission. That's the whole rhythm.`,
  },
  {
    day: 2,
    id: "mission-fragrances-set-overview",
    module: 1,
    moduleTitle: "Quick Start",
    title: "Mission Fragrances Set Overview",
    youtubeId: "FCZ7-xwRPWI",
    minutes: 3,
    trigger: null,
    prompts: [
      {
        id: "mission-fragrances-set-overview:1",
        kind: "text",
        label: "Which of the three Scent Triggers — Honor, Courage, or Commitment — are you most drawn to, and why?",
        placeholder: "Name the one, and say why.",
      },
    ],
    body: `Your set holds three 50ml Scent Triggers. **Honor** is fresh and clean — a fougère built on bergamot, citrus, neroli, and musk. Light enough for every day; I reach for it as a morning pick-me-up heading into work. **Courage** is a citrus aromatic with galbanum, lemongrass, grapefruit, and lavender — noticeable without being loud, and it lasts most of a working day. **Commitment** is my amber-woody: vetiver, cedarwood, sweet amber, vanilla, tonka, and oud. Deeper, for the evening and the lasting impression.

The travel atomizer fills straight from the bottle: pop the nozzle off, press the atomizer onto it, pump a few times, replace the nozzle. [Don't own the set yet? Get Mission Fragrances — $597](/shop)

![Honor scent notes](/images/course/honor-notes.jpg)
![Courage scent notes](/images/course/courage-notes.jpg)
![Commitment scent notes](/images/course/commitment-notes.jpg)`,
  },
  {
    day: 3,
    id: "star-system",
    module: 1,
    moduleTitle: "Quick Start",
    title: "S.T.A.R. System",
    youtubeId: "_xs_ANlHjJ8",
    minutes: 4,
    trigger: null,
    prompts: [],
    body: `S.T.A.R. is how you use a Scent Trigger on purpose. **Select** the value you want to embody right now — Honor, Courage, or Commitment. **Take Action** — spray into the cap, breathe it in, then apply it (two or three sprays on the chest is plenty; add the wrists if you want it to last the day). **Anchor** — close your eyes and recall a moment you actually lived that value; hold it for 5–15 seconds, then open your eyes knowing you are that man because you've already been him. **Repeat** daily.

You'll stop smelling it on yourself within minutes — that's normal olfactory fatigue. Others won't. Reapply the same trigger later if you like, but keep it to two or three sprays every five hours or so, and give this at least two months of daily practice.`,
  },
  // TODO(antonio): the source copy promised "a special gift from the founder"
  // for finishing inside 30 days. Cut until the gift is real — put the
  // sentence back into `body` if it is.
  {
    day: 4,
    id: "30-day-mission-fragrance-challenge",
    module: 1,
    moduleTitle: "Quick Start",
    title: "30 Day Mission Fragrance Challenge",
    youtubeId: null,
    minutes: null,
    trigger: null,
    prompts: [
      {
        id: "30-day-mission-fragrance-challenge:1",
        kind: "commit",
        label: "I commit to using my Scent Triggers daily for the next 30 days.",
      },
    ],
    body: `Consistency is what makes a Scent Trigger work. Every time you wear Honor, Courage, or Commitment and then act on it, you're conditioning your brain to connect that scent with that quality. Skip days and you're just wearing cologne.

So here's the commitment: use your Scent Triggers every day for the next 30 days, one lesson and one Mission a day. You will notice the shift in your mood, your focus, and how you see yourself — not in a week, but over the month.`,
  },
  {
    day: 5,
    id: "mindset-to-succeed",
    module: 1,
    moduleTitle: "Quick Start",
    title: "Mindset To Succeed",
    youtubeId: "MSSMEO8ZGGc",
    minutes: 4,
    trigger: null,
    prompts: [
      {
        id: "mindset-to-succeed:1",
        kind: "commit",
        label: "I commit to being Coachable, Taking Action, and being Patient.",
      },
    ],
    body: `To get anything out of the next 30 days you need three things. **Be coachable** — stay open to new ideas and willing to step outside your comfort zone. **Take action** — passive listening doesn't change anyone; do the small tasks as they come. **Be patient** — this is the gym. You won't see it in week one; habits take up to 60 days, and the men who break through the first few weeks of doubt are the ones who get the growth.

Underneath all three is a growth mindset: believe you can improve, treat setbacks as information, and keep going.`,
  },
  {
    day: 6,
    id: "your-legacy",
    module: 2,
    moduleTitle: "Legacy & Core Values",
    title: "Your Legacy",
    youtubeId: "hbqprG4UFIM",
    minutes: 4,
    trigger: null,
    prompts: [
      {
        id: "your-legacy:1",
        kind: "text",
        label: "Write your own eulogy. What do you want to be remembered for — the impact you made, the relationships you kept, the values you lived by?",
        placeholder: "Take your time. Nobody sees this but you.",
      },
    ],
    body: `Picture walking into a room full of people you know — and seeing a casket. It's your funeral. Nobody is going to talk about your favorite movie or your bench press. They'll talk about how you made them feel, how you showed up as a husband, father, and friend.

Take a few minutes and write what you would want them to say. If you know the values you want to be remembered for, living them becomes a lot easier.`,
  },
  {
    day: 7,
    id: "the-importance-of-honor",
    module: 2,
    moduleTitle: "Legacy & Core Values",
    title: "The Importance Of Honor",
    youtubeId: "a9yG3pylUKY",
    minutes: 3,
    trigger: "honor",
    prompts: [
      {
        id: "the-importance-of-honor:1",
        kind: "text",
        label: "Give three specific examples of times you have been honorable. They can be big or small, recent or years ago.",
        placeholder: "Three moments you did the right thing when it was hard.",
      },
    ],
    body: `I named the three Scent Triggers after my core values, and those came from the Marine Corps. Honor is the first. It isn't something anyone can give you — it's cultivated from within, a gift you give yourself, and its measure isn't recognition but the quiet satisfaction of acting in line with your principles.

In practice honor is your moral compass: be true to your word, stand up for what you believe in, take responsibility for your actions. Define your values, then align what you do with them — especially when it's inconvenient.`,
  },
  {
    day: 8,
    id: "the-need-for-courage",
    module: 2,
    moduleTitle: "Legacy & Core Values",
    title: "The Need For Courage",
    youtubeId: "NCeKnEezPWs",
    minutes: 2,
    trigger: "courage",
    prompts: [
      {
        id: "the-need-for-courage:1",
        kind: "text",
        label: "Give three specific examples of times you have been courageous. Courage isn't being fearless — it's acting in spite of fear.",
        placeholder: "Three moments you acted while the fear was still there.",
      },
    ],
    body: `Courage isn't a switch you flip in a crisis. It's built daily, through the practice of mastering your fear — mental, moral, and physical strength earned by doing the hard thing anyway, and sometimes by making the tough call under pressure.

Most acts of courage are small. Sticking to a plan when it could go wrong. Climbing the ladder when you hate heights. Saying no to the event you don't want to attend. You won't win a medal for any of it, but every one of those builds a courageous man, one day at a time.`,
  },
  {
    day: 9,
    id: "the-power-of-commitment",
    module: 2,
    moduleTitle: "Legacy & Core Values",
    title: "The Power Of Commitment",
    youtubeId: "ihWgFp5H0DU",
    minutes: 2,
    trigger: "commitment",
    prompts: [
      {
        id: "the-power-of-commitment:1",
        kind: "text",
        label: "Give three specific examples of times you have been committed. What matters is that you stayed the course.",
        placeholder: "Three moments you kept showing up.",
      },
    ],
    body: `Commitment is more than a promise. It's a conscious decision to stick to a goal in the face of adversity — the spirit of determination that leads to the mastery of self. It doesn't come and go with your moods; it's fortified by discipline and by mastering your doubts.

It starts small: the gym instead of sleeping in, the healthy meal over fast food, showing up for the plans you made with your buddies. Each of those reinforces your capacity to stay committed to the bigger things.`,
  },
  {
    day: 10,
    id: "shrine-to-self-improvement",
    module: 2,
    moduleTitle: "Legacy & Core Values",
    title: "Shrine To Self-Improvement",
    youtubeId: "GCpsEfFp_E8",
    minutes: 3,
    trigger: null,
    prompts: [
      {
        id: "shrine-to-self-improvement:1",
        kind: "check",
        label: "My shrine is set up.",
      },
    ],
    body: `Build a shrine to your own self-improvement — nothing religious, just a corner of your space dedicated to who you're becoming. Put the Mission Fragrances set there, with the things that remind you of your journey: a book, a quote, a photograph.

Arrange it so it speaks to you, and spend a moment in front of it each day. It becomes a daily visual cue for the man you've decided to be.`,
  },
  {
    day: 11,
    id: "why-you-need-a-vision",
    module: 3,
    moduleTitle: "The Man You Know Yourself To Be",
    title: "Why You Need A Vision",
    youtubeId: "NhI4wxne2Hk",
    minutes: 5,
    trigger: null,
    prompts: [
      {
        id: "why-you-need-a-vision:1",
        kind: "check",
        label: "Ordered my frame and dry-erase markers.",
      },
    ],
    body: `You've reflected on your legacy and your core values. Now we define the man you know yourself to be by building your **Vivid Vision** — a clear picture of where you'll be in three years, personally, professionally, and financially. A vivid vision is a compass; it guides your actions and keeps you moving when motivation dips.

Over the next lessons you'll write it one area at a time, and the app will compile it for you. To set yourself up, order a [frame](https://amzn.to/4bF3UXa) and [dry-erase markers](https://amzn.to/44WsUqT) — you'll be printing and signing this.`,
  },
  {
    day: 12,
    id: "your-reputation",
    module: 3,
    moduleTitle: "The Man You Know Yourself To Be",
    title: "Your Reputation",
    youtubeId: "AWdD1k2ccJ0",
    minutes: 6,
    trigger: null,
    visionSection: "reputation",
    prompts: [
      {
        id: "your-reputation:1",
        kind: "text",
        label: "How do you want people to perceive you three years from now? Be specific — your loved ones, your friends, your colleagues.",
        placeholder: "In three years…",
      },
      {
        id: "your-reputation:2",
        kind: "text",
        label: "List 3–5 concrete actions you'll take to build that reputation.",
        placeholder: "One step per line.",
      },
      {
        id: "your-reputation:3",
        kind: "text",
        label: "What are the biggest challenges or habits that could hold you back — distractions, pride, inconsistency?",
        placeholder: "Be honest. Nobody sees this but you.",
      },
      {
        id: "your-reputation:4",
        kind: "text",
        label: "Identify one small courageous action you can take today to honor your commitment to being your best self.",
        placeholder: "One action. Short. Specific.",
      },
    ],
    missionSuggestions: [
      "Send a text message to your partner expressing gratitude, such as “I’m so thankful to have you in my life.”",
      "Compliment your child on a recent achievement, like saying, “I’m so proud of your hard work on your dance recital.”",
      "Drink a glass of water first thing in the morning to start your day hydrated.",
      "Go for a 10-minute walk around your neighborhood to clear your mind.",
      "Download and start listening to an inspiring audiobook, such as a motivational biography.",
      "Call a friend or family member you haven’t spoken to in a while just to check in and see how they are doing.",
      "Write a thank-you note to a coworker who helped you with a project recently.",
      "Spend five minutes doing a guided meditation to relax and refocus.",
      "Organize your desk or workspace to create a more productive environment.",
      "Set a short-term goal, like reading a chapter of a book each day, and start today by reading the first chapter.",
    ],
    body: `Your reputation is the reflection of your character, and it matters most to the people who depend on you. Society rewards wealth and power; the people who count on you value love, dedication, and wisdom.

Think about the reputation you want three years from now — with your family, your friends, your colleagues — and write it down below. Then take one small courageous action today that honors it.`,
  },
  {
    day: 13,
    id: "relationships",
    module: 3,
    moduleTitle: "The Man You Know Yourself To Be",
    title: "Relationships",
    youtubeId: "NGi4l1rNc50",
    minutes: 4,
    trigger: null,
    visionSection: "relationships",
    prompts: [
      {
        id: "relationships:1",
        kind: "text",
        label: "Describe how you want your relationships to look in three years. Be detailed about your interactions and the quality of your connections.",
        placeholder: "In three years…",
      },
      {
        id: "relationships:2",
        kind: "text",
        label: "List the specific steps you need to take to improve your relationships.",
        placeholder: "One step per line.",
      },
      {
        id: "relationships:3",
        kind: "text",
        label: "What are the biggest obstacles currently holding you back from improving your relationships?",
        placeholder: "Be honest. Nobody sees this but you.",
      },
      {
        id: "relationships:4",
        kind: "text",
        label: "Identify one small courageous action you can take today to honor your commitment to being your best self.",
        placeholder: "One action. Short. Specific.",
      },
    ],
    missionSuggestions: [
      "Text your partner something you appreciate about them.",
      "Leave a note for your child telling them how proud you are of them.",
      "Call the brother you haven’t spoken to in a while just to check in.",
      "Set a date night with your partner or a fun activity with your kids.",
      "Reach out to a friend or relative you’ve had a disagreement with and apologize.",
      "Send an old photo to a friend or family member with a message about why it’s special.",
      "Offer to help a friend or family member with a task or project.",
      "Spend 30 minutes with your family without any distractions (no phones or TV).",
      "Give an unexpected compliment to a coworker or friend.",
      "Reach out to an old friend and suggest catching up over coffee or a phone call.",
    ],
    body: `We get so busy providing and protecting that we forget to nurture the people we're doing it for. Picture the bond you want with your partner, your kids, your family, and your friends three years from now — be specific.

Name the obstacles (too guarded, not enough time), write the steps, and take one small courageous action today. A text or a call is enough to start.`,
  },
  {
    day: 14,
    id: "career-and-business",
    module: 3,
    moduleTitle: "The Man You Know Yourself To Be",
    title: "Career & Business",
    youtubeId: "8UbE1PcGqC0",
    minutes: 3,
    trigger: null,
    visionSection: "career",
    prompts: [
      {
        id: "career-and-business:1",
        kind: "text",
        label: "Describe where you want to be in your career or business in three years. Include your role, your achievements, and the culture you work in.",
        placeholder: "In three years…",
      },
      {
        id: "career-and-business:2",
        kind: "text",
        label: "List the specific steps you need to take to reach that three-year career vision.",
        placeholder: "One step per line.",
      },
      {
        id: "career-and-business:3",
        kind: "text",
        label: "What's holding you back from advancing in your career or business?",
        placeholder: "Be honest. Nobody sees this but you.",
      },
      {
        id: "career-and-business:4",
        kind: "text",
        label: "Identify one small courageous action you can take today to honor your commitment to being your best self.",
        placeholder: "One action. Short. Specific.",
      },
    ],
    missionSuggestions: [
      "Update your resume.",
      "Send a follow-up email to a potential client.",
      "Research industry trends for 15 minutes.",
      "Reach out to a former colleague for a catch-up call.",
      "Set a new short-term career goal and write it down.",
      "Add a new skill to your LinkedIn profile.",
      "Draft a cover letter for a job you're interested in.",
      "Share a relevant article on LinkedIn.",
      "Organize your work desk to boost productivity.",
      "Schedule a quick informational interview with someone in your field.",
    ],
    body: `Where do you want to be in your career or business in three years? Maybe that's a promotion, maybe it's admitting you're in a dead-end job and need a change. Distill it into a clear, concise vision.

Break it into small steps — update the resume, reach out to an old customer, book the informational interview — and name what's holding you back. For most men it's fear of failure or rejection. Write it down; then take one courageous action today.`,
  },
  {
    day: 15,
    id: "health",
    module: 3,
    moduleTitle: "The Man You Know Yourself To Be",
    title: "Health",
    youtubeId: "co2ZBwcMsjM",
    minutes: 4,
    trigger: null,
    visionSection: "health",
    prompts: [
      {
        id: "health:1",
        kind: "text",
        label: "Describe where you want your health, fitness, and diet to be in three years. Be specific about your weight, your body fat, and what you want to be able to do.",
        placeholder: "In three years…",
      },
      {
        id: "health:2",
        kind: "text",
        label: "List the concrete steps needed to get there.",
        placeholder: "One step per line.",
      },
      {
        id: "health:3",
        kind: "text",
        label: "What are the biggest obstacles currently holding you back from improving your health?",
        placeholder: "Be honest. Nobody sees this but you.",
      },
      {
        id: "health:4",
        kind: "text",
        label: "Identify one small courageous action you can take today to honor your commitment to being your best self.",
        placeholder: "One action. Short. Specific.",
      },
    ],
    missionSuggestions: [
      "Do 10 push-ups.",
      "Drink an extra glass of water.",
      "Take a 10-minute walk.",
      "Prep a healthy meal for tomorrow.",
      "Stretch for 5 minutes.",
      "Replace a sugary snack with a piece of fruit.",
      "Try a new workout video online.",
      "Meditate for 5 minutes.",
      "Write down your health goals in a journal.",
      "Stand up and move around for a few minutes if you've been sitting for a while.",
    ],
    body: `Where do you want your health to be in three years — weight, fitness, how you eat, what your body can do? The more specific and vivid, the better.

Write three to seven concrete steps to get there and the obstacles in the way; for most of us it's time, or feeling selfish for taking it. Then do one small thing today: ten push-ups, a ten-minute walk, the healthy meal.`,
  },
  {
    day: 16,
    id: "wealth",
    module: 3,
    moduleTitle: "The Man You Know Yourself To Be",
    title: "Wealth",
    youtubeId: "GqQmxeLr6GI",
    minutes: 4,
    trigger: null,
    visionSection: "wealth",
    prompts: [
      {
        id: "wealth:1",
        kind: "text",
        label: "Describe where you want to be financially in three years. Include savings goals, income streams, and debt.",
        placeholder: "In three years…",
      },
      {
        id: "wealth:2",
        kind: "text",
        label: "List the specific steps you need to take to reach that three-year wealth vision.",
        placeholder: "One step per line.",
      },
      {
        id: "wealth:3",
        kind: "text",
        label: "What are the biggest obstacles currently holding you back from achieving it?",
        placeholder: "Be honest. Nobody sees this but you.",
      },
      {
        id: "wealth:4",
        kind: "text",
        label: "Identify one small courageous action you can take today to honor your commitment to being your best self.",
        placeholder: "One action. Short. Specific.",
      },
    ],
    missionSuggestions: [
      "Open a savings account.",
      "Transfer $10 to your emergency fund.",
      "Review your monthly budget.",
      "Cancel a subscription you don't use.",
      "Set up a meeting with a financial advisor.",
      "Track your expenses for the day.",
      "Read an article about passive income.",
      "Pay an extra $20 towards your debt.",
      "Sell an item you no longer need.",
      "Automate a small monthly transfer to your savings.",
    ],
    body: `Wealth is more than money — earnings, savings, assets, your whole financial health. Picture three years out: an emergency fund, a passive income stream, debt gone. Be realistic and ambitious at the same time.

Write the steps (a raise, a new income stream) and the obstacles — usually fear of failure or of change. Then take one action today: open the savings account, move $10, cancel the subscription you don't use.`,
  },
  {
    day: 17,
    id: "lifestyle",
    module: 3,
    moduleTitle: "The Man You Know Yourself To Be",
    title: "Lifestyle",
    youtubeId: "qF8IJk2xadQ",
    minutes: 3,
    trigger: null,
    visionSection: "lifestyle",
    prompts: [
      {
        id: "lifestyle:1",
        kind: "text",
        label: "Describe your ideal lifestyle three years from now. Be specific about where you want to live and how you want to live.",
        placeholder: "In three years…",
      },
      {
        id: "lifestyle:2",
        kind: "text",
        label: "List the specific steps you need to take to get there.",
        placeholder: "One step per line.",
      },
      {
        id: "lifestyle:3",
        kind: "text",
        label: "What are the biggest obstacles currently holding you back from achieving it?",
        placeholder: "Be honest. Nobody sees this but you.",
      },
      {
        id: "lifestyle:4",
        kind: "text",
        label: "Identify one small courageous action you can take today to honor your commitment to being your best self.",
        placeholder: "One action. Short. Specific.",
      },
    ],
    missionSuggestions: [
      "Research a new city you want to live in.",
      "Save $20 towards your travel fund.",
      "Look up job opportunities in your dream location.",
      "Spend 10 minutes decluttering a room in your house.",
      "Plan a small trip or weekend getaway.",
      "Explore online communities in your desired location.",
      "Create a Pinterest board for your dream home.",
      "Set a daily reminder to visualize your ideal lifestyle.",
      "Talk to a friend or family member about your goals.",
      "Write down one thing you love about your current lifestyle to build a positive mindset.",
    ],
    body: `Now the fun part. Where do you want to live, how do you want to live, and what needs to change? The dream home, the travel, the new city — describe it like you can see it.

Write the steps and the obstacles (money, family commitments, fear of change). Then one small action today: research the city, save $20 toward the trip, declutter one room.`,
  },
  {
    day: 18,
    id: "social-impact-and-your-legacy",
    module: 3,
    moduleTitle: "The Man You Know Yourself To Be",
    title: "Social Impact & Your Legacy",
    youtubeId: "oU7fHhMoXoY",
    minutes: 4,
    trigger: null,
    visionSection: "legacy",
    prompts: [
      {
        id: "social-impact-and-your-legacy:1",
        kind: "text",
        label: "Describe the legacy you want to have in three years. Include your community involvement and the impact you want to make.",
        placeholder: "In three years…",
      },
      {
        id: "social-impact-and-your-legacy:2",
        kind: "text",
        label: "List the specific steps you need to take — volunteering, donating, starting a community project.",
        placeholder: "One step per line.",
      },
      {
        id: "social-impact-and-your-legacy:3",
        kind: "text",
        label: "What are the biggest obstacles currently holding you back from achieving it?",
        placeholder: "Be honest. Nobody sees this but you.",
      },
      {
        id: "social-impact-and-your-legacy:4",
        kind: "text",
        label: "Identify one small courageous action you can take today to honor your commitment to being your best self.",
        placeholder: "One action. Short. Specific.",
      },
    ],
    missionSuggestions: [
      "Research a local charity to volunteer with.",
      "Donate $10 to a cause you care about.",
      "Write a letter of appreciation to a community leader.",
      "Plant a tree in your neighborhood.",
      "Spend an hour cleaning up a local park.",
      "Organize a small fundraiser for a charity.",
      "Share an inspiring story on social media.",
      "Mentor a young person in your community.",
      "Attend a community meeting or event.",
      "Reach out to a local organization to offer your skills.",
    ],
    body: `Finally, your legacy beyond your own circle — the impact you want to have on your community in three years. Charitable work, mentoring, being the man other men look to. Be specific.

Write the steps and the obstacles (time, money, fear of judgment). Then one action today: research a local charity, donate $10, mentor someone, plant the tree.`,
  },
  {
    day: 19,
    id: "mindset-for-achieving-your-vivid-vision",
    module: 4,
    moduleTitle: "Laws Of Men Who Get Sh*t Done",
    title: "Mindset for Achieving Your Vivid Vision",
    youtubeId: "odhvU6I3Kz0",
    minutes: 5,
    trigger: null,
    prompts: [
      {
        id: "mindset-for-achieving-your-vivid-vision:1",
        kind: "commit",
        label: "I commit to having a growth, abundance, and resilient mindset.",
      },
    ],
    body: `Most obstacles fall into money, time, resources, effort, or slow progress. Getting past them starts in the mind. **Resilience** — treat obstacles as the challenges that make the story worth telling, and get back up. **Growth** — you can learn at any age; change your mind when the facts change. **Abundance** — the world isn't a pie with limited slices; focus on creating value.

Hold those three mindsets and your Vivid Vision becomes buildable.`,
  },
  {
    day: 20,
    id: "pareto-principle",
    module: 4,
    moduleTitle: "Laws Of Men Who Get Sh*t Done",
    title: "Pareto Principle",
    youtubeId: "CiNTVRxOgyY",
    minutes: 5,
    trigger: null,
    prompts: [
      {
        id: "pareto-principle:1",
        kind: "text",
        label: "Where in your life would the 80/20 principle create the biggest impact right now? Be specific.",
      },
    ],
    body: `The 80/20 principle: 80% of results come from 20% of efforts. In business, 20% of customers drive 80% of sales. The same is true in your life.

Find the few areas where a small effort gives a big result and put your energy there. Then wear your Scent Trigger and take one small courageous action today.`,
  },
  {
    day: 21,
    id: "essentialism",
    module: 4,
    moduleTitle: "Laws Of Men Who Get Sh*t Done",
    title: "Essentialism",
    youtubeId: "VkA4H2mZNII",
    minutes: 4,
    trigger: null,
    prompts: [
      {
        id: "essentialism:1",
        kind: "text",
        label: "What small step will you take in the next 24 hours to embrace Essentialism?",
        placeholder: "Clear one drawer. Cut one meeting. Say no once.",
      },
    ],
    body: `Essentialism is zeroing in on the vital few things that truly matter. When Steve Jobs returned to Apple he cut the product line to focus on what counted — and it worked. Use the Eisenhower Matrix to protect the important-but-not-urgent work that always gets buried.

Declutter your schedule the way you'd declutter a closet: say no to good things so you have room to say yes to great ones. What's one step you can take in the next 24 hours?`,
  },
  {
    day: 22,
    id: "1-percent-better-daily",
    module: 4,
    moduleTitle: "Laws Of Men Who Get Sh*t Done",
    title: "1% Better Daily",
    youtubeId: "MePOS7sTKH0",
    minutes: 3,
    trigger: null,
    prompts: [
      {
        id: "1-percent-better-daily:1",
        kind: "text",
        label: "Where can you get 1% better today? Keep it small — one tiny improvement.",
      },
    ],
    body: `Get 1% better every day. Toyota built a company on it; James Clear showed how tiny gains compound — 1% a day is 37× better by year's end.

Pick one area to improve by a sliver today — a skill, a routine, a relationship — and use your Scent Trigger to anchor the habit of one small courageous action.`,
  },
  {
    day: 23,
    id: "doing-nothing-vs-doing-one-thing",
    module: 4,
    moduleTitle: "Laws Of Men Who Get Sh*t Done",
    title: "Doing Nothing vs. Doing One Thing",
    youtubeId: "FaJhvhVPb9c",
    minutes: 3,
    trigger: null,
    prompts: [
      {
        id: "doing-nothing-vs-doing-one-thing:1",
        kind: "text",
        label: "What's the one thing you're going to get done today that will make a difference?",
      },
    ],
    body: `Doing one thing beats doing nothing. If you can't fit the 30-minute run, do a few air squats or one pull-up. The barrier isn't the workout — it's inaction. Mel Robbins' 5-Second Rule helps: count down from five and move.

My rule is I only have to step into the gym. Once I'm there I usually train. Set the bar low, start, and you're already ahead of the man who did nothing. What's the one thing you'll get done today?`,
  },
  {
    day: 24,
    id: "latent-potential",
    module: 4,
    moduleTitle: "Laws Of Men Who Get Sh*t Done",
    title: "Latent Potential",
    youtubeId: "qWaP70yaVe0",
    minutes: 4,
    trigger: null,
    prompts: [
      {
        id: "latent-potential:1",
        kind: "text",
        label: "Where in your life is there latent potential — something heating up, waiting to ignite?",
      },
    ],
    body: `Put paper in an oven at 100°, 200°, 400° and nothing happens — at 451° it ignites. The energy was building the whole time. Your fitness, your business, your investments work the same way: slow, invisible progress, then a tipping point.

John Grisham's first book flopped; his second, The Firm, exploded. The potential was there all along. Where in your life is something heating up, waiting to ignite?`,
  },
  {
    day: 25,
    id: "identity-based-decision-making",
    module: 4,
    moduleTitle: "Laws Of Men Who Get Sh*t Done",
    title: "Identity-Based Decision Making",
    youtubeId: "ZMBy99RiuvM",
    minutes: 5,
    trigger: null,
    prompts: [
      {
        id: "identity-based-decision-making:1",
        kind: "text",
        label: "How do you see yourself? What identity do you hold?",
        placeholder: "Be generous. Describe yourself as your future self would.",
      },
    ],
    body: `Identity-based decisions go deeper than goals. Michael Phelps wanted medals, but he was in the pool every day because he's a swimmer. If you see yourself as a healthy man, you skip the junk food because of who you are, not to hit a number.

You're already the man in your three-year vision inside. Write down how you identify — healthy, successful, a dedicated family man — and let your actions follow.`,
  },
  {
    day: 26,
    id: "smart-goals",
    module: 4,
    moduleTitle: "Laws Of Men Who Get Sh*t Done",
    title: "SMART Goals",
    youtubeId: "QZQjcgh26jA",
    minutes: 4,
    trigger: null,
    visionSection: "smart",
    prompts: [
      {
        id: "smart-goals:1",
        kind: "text",
        label: "Write one S.M.A.R.T. goal aligned to your three-year Vivid Vision.",
        placeholder: "Specific. Measurable. Attainable. Relevant. Time-bound.",
      },
    ],
    body: `S.M.A.R.T. goals: Specific, Measurable, Attainable, Relevant, Time-bound. Not "jump higher" — "add five inches to my vertical in six months." It keeps you accountable and your effort focused.

Write one S.M.A.R.T. goal aligned with your Vivid Vision, then wear your Scent Trigger and take one small courageous action today.`,
  },
  {
    day: 27,
    id: "your-vivid-vision-is-coming-to-life",
    module: 5,
    moduleTitle: "Forge Your Vivid Vision",
    title: "Your Vivid Vision Is Coming to Life",
    youtubeId: "SwZrllkuszY",
    minutes: 4,
    trigger: null,
    prompts: [],
    body: `You've made it through the hardest part: values reflected on, mindset sharpened, courageous actions taken daily. Now we bring it together into your personalized 3-Year Vivid Vision — reputation, relationships, career, health, wealth, lifestyle, and legacy, built from everything you've written.

Tap **Build my Vivid Vision** below. The app compiles your answers into one document; read it, and if you'd like my team's help refining it, send it to us from that page.`,
  },
  {
    day: 28,
    id: "review-your-vivid-vision",
    module: 5,
    moduleTitle: "Forge Your Vivid Vision",
    title: "Review Your Vivid Vision",
    youtubeId: null,
    minutes: null,
    trigger: null,
    prompts: [],
    body: `Open your Vivid Vision and read it slowly. Sit with it. Feel it. This isn't homework — it's a snapshot of the man you're becoming. Does it feel true and exciting? Is anything important missing? Has anything changed?

Then refine it with your two filters: **80/20** — which 20% of these goals create 80% of the results; build your systems around those. **Essentialism** — cut anything unnecessary or overcomplicated. Your future deserves a vision that is clear and focused, not bloated.`,
  },
  {
    day: 29,
    id: "broadcast-your-vivid-vision",
    module: 5,
    moduleTitle: "Forge Your Vivid Vision",
    title: "Broadcast Your Vivid Vision",
    youtubeId: null,
    minutes: null,
    trigger: null,
    prompts: [
      {
        id: "broadcast-your-vivid-vision:1",
        kind: "check",
        label: "Scheduled my 3-year review date.",
      },
      {
        id: "broadcast-your-vivid-vision:2",
        kind: "check",
        label: "Printed and framed my Vivid Vision.",
      },
    ],
    body: `Your Vivid Vision is no longer just words. Print it and put it somewhere you'll see every day — your desk, your office, your shrine. Framed, it becomes a daily reminder, a visual trigger for consistency, a commitment to yourself.

Then share it. Telling a trusted circle makes you accountable, earns you honest feedback, and lets people support you. Schedule a date three years from today to revisit it.`,
  },
  {
    day: 30,
    id: "frame",
    module: 5,
    moduleTitle: "Forge Your Vivid Vision",
    title: "Frame",
    youtubeId: null,
    minutes: null,
    trigger: null,
    prompts: [
      {
        id: "frame:1",
        kind: "check",
        label: "Scheduled my 3-year review date.",
      },
      {
        id: "frame:2",
        kind: "check",
        label: "Printed and framed my Vivid Vision.",
      },
    ],
    body: `Day 30. Print and frame your Vivid Vision, and take one more small courageous action to honor your commitment to being your best self.

The challenge ends here. The Mission doesn't — the Log keeps going, and so do you.`,
  },];

export const LESSON_COUNT = LESSONS.length;

export function lessonForDay(day: number): Lesson | undefined {
  return LESSONS.find((lesson) => lesson.day === day);
}

export function getLesson(id: string): Lesson | undefined {
  return LESSONS.find((lesson) => lesson.id === id);
}

export function moduleOf(lesson: Lesson): Module | undefined {
  return MODULES.find((module) => module.number === lesson.module);
}

/** The next lesson in course order, crossing module boundaries. */
export function nextLesson(id: string): Lesson | undefined {
  const index = LESSONS.findIndex((lesson) => lesson.id === id);
  if (index === -1) return undefined;
  return LESSONS[index + 1];
}
