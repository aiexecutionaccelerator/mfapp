import type { RecordKind, Trigger } from "@/lib/data/types";

/**
 * The 30 Missions, curriculum revision 2 (Antonio, 28 Oct 2026).
 *
 * Source of truth: docs/specs/curriculum-v2-spec.txt. Every user-facing
 * string below is the spec's exact wording. Change it there first, and
 * change a Mission as a unit (title, task, options, prompt, examples and
 * Done when together), or the old and new wording contradict each other.
 * `implementation` and `rationale` are notes for us, never shown.
 *
 * Records made under the first curriculum keep their own wording:
 * see `missions-v1.ts` and `CURRICULUM_VERSION`.
 *
 * One reusable Mission template renders these. Never add a per-Mission
 * component. Per-Mission rules (prerequisites, context, fields) live in
 * `lib/curriculum.ts`.
 */

export const CURRICULUM_VERSION = 2;

export type Stage = "self-trust" | "standards" | "values" | "momentum";

export const STAGES: Record<Stage, { label: string; range: [number, number] }> =
  {
    standards: { label: "Know your code", range: [1, 7] },
    "self-trust": { label: "Build self-trust", range: [8, 14] },
    values: { label: "Put your values to work", range: [15, 21] },
    momentum: { label: "Build lasting momentum", range: [22, 30] },
  };

export interface MissionDef {
  number: number;
  /** Stable key: drafts and legacy answers are filed under it. */
  slug: string;
  title: string;
  stage: Stage;
  /** The suggested Scent Trigger. He can choose another. */
  recommendedTrigger: Trigger;
  /** What saving it creates. Decides the button, the success line and the counts. */
  kind: RecordKind;
  time: string;
  /** One line under the title. */
  hook: string;
  /**
   * "The idea": the one principle this Mission teaches, shown above the
   * S.T.A.R. steps (revision 2.2, 19 Nov). What he should leave knowing.
   */
  idea: string;
  /** A short plain explanation under the idea, where the task needs one. */
  intro?: string;
  /** The Select step: why this value fits this Mission. */
  select: string;
  /** The Act step: the assignment. */
  action: string;
  /** The spec's three ways to do it. Not shown; the starters come from them. */
  choices: [string, string, string];
  /** The Record step's question. */
  prompt: string;
  /** The spec's two examples. Kept for the record; the screen shows `starters`. */
  examples: [string, string];
  /**
   * Tap-to-start openings on the Record step (Antonio, 18 Nov 2026): each
   * fills the start of his answer, and he finishes it in his own words.
   * They come from the three ways to do it. Never a finished answer.
   */
  starters: string[];
  doneWhen: string;
  note?: string;
  /** Optional photo (Missions 1 and 19 only). */
  photo?: boolean;
  /** Optional, never required. */
  youtubeId: string | null;
  /** For us: how it connects to the Missions around it. Not shown. */
  implementation: string;
  /** For us: why it changed from the first curriculum. Not shown. */
  rationale: string;
}

/** Optional intro videos reused from the old library. Never block progress. */
export const INTRO_VIDEOS = {
  moreThanFragrance: "p1VGPvExpx0",
  star: "_xs_ANlHjJ8",
  usingYourSet: "FCZ7-xwRPWI",
} as const;

/** Antonio explaining each value: under Meet Your Scent Triggers, and on
    Missions 2, 3 and 4. */
export const TRIGGER_VIDEOS: Record<Trigger, string> = {
  honor: "a9yG3pylUKY",
  courage: "NCeKnEezPWs",
  commitment: "ihWgFp5H0DU",
};

/** Mission 13 opens on this when he has no identity statement yet. */
export const DEFAULT_IDENTITY =
  "Keeps his word, acts despite fear, and follows through.";

/** Mission 21's six focus areas. */
export const FOCUS_AREAS = [
  "Relationships",
  "Health",
  "Work",
  "Money",
  "Home",
  "Service",
] as const;
export type FocusArea = (typeof FOCUS_AREAS)[number];

/** Missions 27 and 30: how often the practice repeats. */
export const FREQUENCIES = ["Daily", "Three times a week", "Weekly"] as const;
export type Frequency = (typeof FREQUENCIES)[number];

export const MISSIONS: MissionDef[] = [
  {
    number: 1,
    slug: "m7",
    title: "Build Your Shrine",
    stage: "standards",
    recommendedTrigger: "courage",
    kind: "action",
    time: "About 2 minutes",
    hook: "Build a shrine to self-improvement. It’s one spot that reminds you every day to become the man you know yourself to be.",
    idea: "A shrine to self-improvement is one spot in your home or office. Every time you walk past it, your Scent Triggers remind you that you’re working to become your best self.",
    select: "Courage starts in plain sight. Your shrine reminds you every day who you’re working to become.",
    action: "Pick a spot you walk past every morning. Then place your set there.",
    choices: [
      "Put them next to your watch, where you get ready each morning.",
      "Put them on a shady shelf in your bedroom.",
      "Put them on your dresser, next to your wallet and keys.",
    ],
    prompt: "Where is your shrine to self-improvement?",
    examples: [
      "I set my bottles on the shelf next to my watch.",
      "I cleared a spot on my dresser, next to my wallet and keys.",
    ],
    starters: [
      "I set my bottles on ",
      "I cleared a spot on my ",
      "I placed my bottles ",
    ],
    doneWhen: "Your bottles are in place, somewhere you’ll see them every day.",
    note: "Pick a safe spot. One bottle is enough to start. A photo is optional. Setting up your shrine completes this mission. The practice comes next.",
    photo: true,
    youtubeId: "GCpsEfFp_E8",
    implementation: "Opens the course with a physical reminder, on Courage, the fragrance most men like best. Mission 27 later adds a repeatable practice.",
    rationale: "Previous titles: Put Your Reminder Where You Will See It; Give Your Practice a Place. A shrine to self-improvement, explained through trophy cases and Stoic busts (Antonio, 23 Nov). One question, not two.",
  },
  {
    number: 2,
    slug: "m8",
    title: "Define Your Honor",
    stage: "standards",
    recommendedTrigger: "honor",
    kind: "code",
    time: "3–5 minutes",
    hook: "Decide what honor means to you in one sentence.",
    idea: "Honor means living by a moral code. You tell the truth. You keep your promises. You own your actions.",
    select: "You live by a moral code. You tell the truth, keep your promises and own your actions. Integrity · Responsibility · Respect.",
    action: "Pick the line that fits you best. Then make it yours.",
    choices: [
      "Honesty: how will you tell the truth?",
      "Responsibility: how will you own your part?",
      "Respect: how will you treat people who can do nothing for you?",
    ],
    prompt: "For me, honor means…",
    examples: [
      "Telling the truth about my mistakes and fixing them.",
      "Giving people credit for their work, even when I could take it myself.",
    ],
    starters: [
      "Doing what I say I will do and telling the truth, even when it costs me.",
      "Owning my mistakes and making them right. No excuses. No blame.",
      "Treating people with respect, especially people who can do nothing for me.",
    ],
    doneWhen: "One clear Honor line is saved to your Personal Code.",
    note: "This sets your standard. You’ll put a line of your code to work in Mission 14. Writing the words is the start. Living them is the proof.",
    youtubeId: "a9yG3pylUKY",
    implementation: "Defines Honor first. Creates code line 1, required with lines 3, 4, 11 and 12 for Missions 14 and 29.",
    rationale: "Previous title: Honor in Your Words. Turns an abstract value definition into an observable standard.",
  },
  {
    number: 3,
    slug: "m9",
    title: "Define Your Courage",
    stage: "standards",
    recommendedTrigger: "courage",
    kind: "code",
    time: "3–5 minutes",
    hook: "Courage is acting while you’re still afraid.",
    idea: "Courage isn’t the absence of fear. It’s doing the right thing while the fear is still there.",
    select: "You do what you know is right, even when you’re afraid or under pressure. Speak Honestly · Move First · Act Despite Fear.",
    action: "Pick the line that fits you best. Then make it yours.",
    choices: [
      "Name a hard conversation you tend to avoid.",
      "Name a time you need to ask for help.",
      "Name a first step you keep putting off because people might judge you.",
    ],
    prompt: "For me, courage means…",
    examples: [
      "Asking for help when I’m stuck instead of pretending I understand.",
      "Speaking up honestly and respectfully when I disagree.",
    ],
    starters: [
      "Doing the right thing, even when I’m afraid of how it will go.",
      "Speaking up honestly when staying quiet would be easier.",
      "Taking the first step on hard tasks instead of waiting to feel ready.",
    ],
    doneWhen: "One clear Courage line is saved to your Personal Code.",
    note: "Courage has a purpose. Your line shouldn’t call for danger, picking fights or ignoring good judgment.",
    youtubeId: "NCeKnEezPWs",
    implementation: "Defines Courage straight after Honor. Creates code line 2; Mission 6 puts it into action.",
    rationale: "Previous title: Courage in Your Words. Names worthwhile discomfort and a behavior, with no encouragement to take reckless risks.",
  },
  {
    number: 4,
    slug: "m10",
    title: "Define Your Commitment",
    stage: "standards",
    recommendedTrigger: "commitment",
    kind: "code",
    time: "3–5 minutes",
    hook: "Decide what showing up looks like.",
    idea: "Commitment means showing up. You do what you said you’d do. You cut out distractions. You finish what you start.",
    select: "You do your part again and again, even when it gets hard. Discipline · Consistency · Follow-Through.",
    action: "Pick the line that fits you best. Then make it yours.",
    choices: [
      "Describe showing up for someone who counts on you.",
      "Describe making time for what matters most and protecting it.",
      "Describe getting back on track after you miss.",
    ],
    prompt: "For me, commitment means…",
    examples: [
      "Giving my most important work ten focused minutes, and getting back to it fast if I miss.",
      "Keeping regular time with my family, and rescheduling honestly when something real comes up.",
    ],
    starters: [
      "Showing up for the people who count on me, every time I said I would.",
      "Doing the small, important work every day, even when I don’t feel like it.",
      "Finishing what I start, and getting back on track fast when I slip.",
    ],
    doneWhen: "One clear Commitment line is saved to your Personal Code.",
    note: "Pick a standard you can live up to. “Never fail” leaves you no way back when you slip.",
    youtubeId: "ihWgFp5H0DU",
    implementation: "Defines Commitment, the third value, the first time the darker Commitment bottle is worn. Creates code line 3; Mission 7 puts it into action.",
    rationale: "Previous title: Commitment in Your Words. Builds returning after a miss into the definition of commitment.",
  },
  {
    number: 5,
    slug: "m1",
    title: "Give Credit Where Credit Is Due",
    stage: "standards",
    recommendedTrigger: "honor",
    kind: "action",
    time: "About 2 minutes",
    hook: "Notice what others have done for you. Then have the courage to tell them.",
    idea: "None of us made it alone. Most of the people who helped us never got the thanks they deserved. Today we change that.",
    select: "Honor means seeing what other people did for you and giving them credit.",
    action: "Tell one person exactly what they did and why it mattered to you.",
    choices: [
      "Thank someone close to you for a specific way they helped you.",
      "Give a coworker credit for something they made easier.",
      "Thank someone whose everyday effort you usually take for granted.",
    ],
    prompt: "Who did you thank, and what did you tell them?",
    examples: [
      "I thanked my brother for checking in on me during a rough week.",
      "I told my coworker her careful handover helped me finish the job.",
    ],
    starters: [
      "I thanked my ",
      "I gave my coworker credit for ",
      "I gave recognition to someone who ",
    ],
    doneWhen: "You told them. Thinking it or writing a draft doesn’t count yet.",
    youtubeId: null,
    implementation: "Puts the Honor line from Mission 2 into action with an achievable act of respect.",
    rationale: "Previous title: Prove It. Keeps the quick first win, but makes respect and giving credit its explicit purpose.",
  },
  {
    number: 6,
    slug: "m2",
    title: "Break It Into Small Steps",
    stage: "standards",
    recommendedTrigger: "courage",
    kind: "action",
    time: "2–5 minutes",
    hook: "Break the task you’ve been putting off into small steps.",
    idea: "Most of us put off a task when it feels too big. The trick is to break it into smaller parts.",
    select: "Courage means moving toward a task that matters, even while it feels uncomfortable.",
    action: "Choose a task you’ve put off. Break it into parts. Then take action on the first one.",
    choices: [
      "Send the email you’ve been putting off.",
      "Book the appointment you keep delaying.",
      "Fill out the first part of a form you need to finish.",
    ],
    prompt: "What were you putting off, and what first step did you take?",
    examples: [
      "I was putting off the repair call. I called and asked for a price.",
      "I was dreading the application. I filled out the contact section.",
    ],
    starters: [
      "I was avoiding ",
      "I was putting off ",
      "I was dreading ",
    ],
    doneWhen: "One real step is done. The whole task doesn’t have to be.",
    note: "Pick an everyday task you can handle. This mission is about pushing through discomfort, not taking risks.",
    youtubeId: null,
    implementation: "Puts the Courage line from Mission 3 into action. Missions 17 and 22 later develop sustained focus and goal-directed courage.",
    rationale: "Previous title: Stop Putting It Off. Defines a manageable avoided task and requires a real first step.",
  },
  {
    number: 7,
    slug: "m3",
    title: "Keep One Small Promise",
    stage: "standards",
    recommendedTrigger: "commitment",
    kind: "action",
    time: "Time varies",
    hook: "Give yourself a reason to trust your own word.",
    idea: "Every promise you keep is proof that you’re a man of your word. Start small.",
    select: "Commitment turns what you said into something people can count on. That includes you.",
    action: "Choose a small promise you can keep today.",
    choices: [
      "Return a call or message when you said you would.",
      "Finish a small job you agreed to handle.",
      "Keep a small promise to yourself, like five minutes on a task you’ve ignored.",
    ],
    prompt: "What did you promise, and how did you follow through?",
    examples: [
      "I promised to return the drill I borrowed. I dropped it off today.",
      "I promised myself five minutes on the paperwork. I did all five.",
    ],
    starters: [
      "I promised to ",
      "I said I would ",
      "I committed to spending five minutes on ",
    ],
    doneWhen: "You kept the promise. A promise for later stays a draft.",
    youtubeId: null,
    implementation: "Puts the Commitment line from Mission 4 into action. Prepares what matters most in Mission 12.",
    rationale: "Previous title: Keep Your Word. Distinguishes making a promise from fulfilling it; offers a route when no promise is pending.",
  },
  {
    number: 8,
    slug: "m4",
    title: "Own Your Part",
    stage: "self-trust",
    recommendedTrigger: "honor",
    kind: "action",
    time: "5–10 minutes",
    hook: "Self-respect includes admitting when you got something wrong.",
    idea: "Owning a mistake builds more trust than never making one.",
    select: "Honor means owning what you did, without blaming others or demanding forgiveness.",
    action: "Choose one small mistake. Admit it plainly. Then take one step to make it right.",
    choices: [
      "Correct wrong information you gave someone, and tell them what changed.",
      "Admit you missed something you were responsible for, and finish part of it.",
      "Apologize for one specific careless act, and make a small repair.",
    ],
    prompt: "What did you take responsibility for, and what did you do to repair it?",
    examples: [
      "I told my coworker I’d sent the wrong date. Then I sent the right details.",
      "I admitted I’d left the kitchen for someone else. Then I cleaned it.",
    ],
    starters: [
      "I made a mistake by ",
      "I owned that I had not ",
      "I apologized to ",
    ],
    doneWhen: "You’ve admitted your part and fixed what you could.",
    note: "Pick an everyday situation that’s safe to bring up. You don’t need to share private details in your log. You don’t need anyone’s forgiveness either.",
    youtubeId: null,
    implementation: "Extends respect into accountability. Supplies a practical repair model for Missions 8, 11, and 26.",
    rationale: "Previous title: Honor Someone Who Matters. Replaces the second gratitude task with accountability and a practical repair.",
  },
  {
    number: 9,
    slug: "m5",
    title: "Humble Yourself and Ask for Help",
    stage: "self-trust",
    recommendedTrigger: "courage",
    kind: "action",
    time: "2–5 minutes",
    hook: "Asking for help takes strength, not weakness.",
    idea: "Pride stops a lot of men from asking for help. But asking makes your relationships stronger.",
    select: "Courage means admitting what you don’t know and what you need.",
    action: "Ask one clear question. Or ask for one specific piece of help.",
    choices: [
      "Ask someone to explain a part of a task you don’t understand.",
      "Ask for feedback on one piece of your work.",
      "Ask someone you trust for a hand with a practical task.",
    ],
    prompt: "What did you ask, and how did it feel to ask?",
    examples: [
      "I asked my coworker to explain the step I’d been pretending to understand.",
      "I asked a friend to look over the start of my presentation.",
    ],
    starters: [
      "I asked my coworker to explain ",
      "I asked for feedback on ",
      "I asked a friend to help me with ",
    ],
    doneWhen: "You asked. You don’t need a reply or a yes.",
    youtubeId: null,
    implementation: "Makes asking for help a legitimate expression of courage. Informs the Courage line and later goal work.",
    rationale: "Previous title: Act Before You Are Ready. Replaces another generic start with the distinct skill of asking for help or feedback.",
  },
  {
    number: 10,
    slug: "m6",
    title: "Remember Your Own Strength",
    stage: "self-trust",
    recommendedTrigger: "commitment",
    kind: "reflection",
    time: "3–5 minutes",
    hook: "When self-doubt sets in, remember that you’ve beaten hard times before.",
    idea: "You’re stronger than you give yourself credit for. You’ve already been through hard times to get where you are.",
    select: "Commitment means knowing you’ve kept going before. So you can keep going again.",
    action: "Recall one specific time you acted with honor, courage or commitment.",
    choices: [
      "Recall telling the truth when hiding it would have been easier.",
      "Recall taking a step forward while you were nervous.",
      "Recall sticking with a responsibility during a hard time.",
    ],
    prompt: "What happened, what did you do, and what does it remind you that you can do?",
    examples: [
      "I admitted I missed a deadline and helped fix the problem. I can own my part, even when I’m embarrassed.",
      "I kept visiting my dad during a hard month. I can keep showing up.",
    ],
    starters: [
      "I spoke the truth when ",
      "I was nervous, but I still ",
      "I kept showing up for ",
    ],
    doneWhen: "You’ve written down one specific memory and the strength you want to use again.",
    note: "Pick the Scent Trigger that matches the memory. This mission is about looking back. A new action today gets its own record.",
    youtubeId: null,
    implementation: "Uses one real memory as evidence before writing standards. It does not increase the action count.",
    rationale: "Previous title: Remember Who You Have Been. Keeps reflection, but asks for a specific event, behavior, and reusable quality.",
  },
  {
    number: 11,
    slug: "m11",
    title: "Draw Your Line",
    stage: "self-trust",
    recommendedTrigger: "honor",
    kind: "code",
    time: "3–5 minutes",
    hook: "Name one rule you live by and won’t break.",
    idea: "Decide your line before the pressure hits. It’s what you will always do, or never do, no matter who is watching.",
    select: "Honor is easier to hold when you’ve already decided how you’ll handle pressure.",
    action: "Write one line you stand for and won’t bend on.",
    choices: [
      "Instead of hiding a mistake, admit it and fix it.",
      "Instead of taking credit you didn’t earn, name the person who did the work.",
      "Instead of promising what you can’t deliver, say what you can do.",
    ],
    prompt: "What do you stand for that you won’t bend on?",
    examples: [
      "I won’t hide a mistake to protect my image. I’ll admit it and fix what I can.",
      "I won’t promise time I can’t give. I’ll offer what I can really do.",
    ],
    starters: [
      "I do not lie. My word is my bond.",
      "I do what I say I’m going to do.",
      "I will not stand by while people are bullied.",
    ],
    doneWhen: "Your line is saved.",
    youtubeId: null,
    implementation: "Adds a usable response to pressure. Creates code line 4 and prepares the boundary practiced in Mission 24.",
    rationale: "Previous title: The Line You Will Not Cross. Adds the behavior to use instead of only naming a prohibition.",
  },
  {
    number: 12,
    slug: "m12",
    title: "Choose What Matters Most",
    stage: "self-trust",
    recommendedTrigger: "commitment",
    kind: "code",
    time: "3–5 minutes",
    hook: "Pick one goal that really matters to you.",
    idea: "A man with ten priorities has none.",
    select: "Commitment needs a direction. What you choose here guides the missions that come later.",
    action: "Choose one goal you can make real progress on in the next few weeks. Then say why it matters.",
    choices: [
      "Choose a person: give someone you care about regular, full attention.",
      "Choose a personal goal: spend a short block of time on its next step.",
      "Choose your health: repeat one small action that helps you feel better.",
    ],
    prompt: "What’s one goal you want to reach, and why does it matter?",
    examples: [
      "I want to finish my certification, because it gives me more options at work.",
      "I want to put my phone away at dinner, because I want to be present with the people I love.",
    ],
    starters: [
      "I want to finish ",
      "I want to get back in shape by ",
      "I want to spend more time with ",
    ],
    doneWhen: "One goal is saved, with a reason it matters.",
    note: "Today you choose the goal. The work comes later. You can adjust it as you learn what works.",
    youtubeId: null,
    implementation: "Creates code line 5 and the promise shown in Missions 15–21. This supplies direction for later planning.",
    rationale: "Previous title: The Promise That Matters Most. Establishes a meaningful promise early so later work has a direction.",
  },
  {
    number: 13,
    slug: "m13",
    title: "Name the Man You Are Becoming",
    stage: "self-trust",
    recommendedTrigger: "courage",
    kind: "code",
    time: "About 3 minutes",
    hook: "Describe the man you’re working to become.",
    idea: "You act like the man you believe you are.",
    select: "Courage means choosing how you’ll act before you feel confident.",
    action: "Read the statement below. Keep it, add any lines that fit or write your own.",
    choices: [
      "Describe a man who owns what he does.",
      "Describe a man who acts even when he’s afraid.",
      "Describe a man who follows through and gets back up after setbacks.",
    ],
    prompt: "I am becoming a man who…",
    examples: [
      "Keeps his word, admits his mistakes and makes them right.",
      "Takes the next step, even when he feels unsure.",
    ],
    starters: [
      "Keeps his word and owns his mistakes.",
      "Acts despite fear and speaks up when it matters.",
      "Shows up every day and finishes what he starts.",
    ],
    doneWhen: "You’ve kept or updated your statement on purpose.",
    note: "You don’t have to be perfect. Your statement is the direction you’re choosing. It’s not a grade on your worth.",
    youtubeId: null,
    implementation: "Summarizes the code and promise as an identity direction. Save updates profile identity; opening the page does not.",
    rationale: "Previous title: The Man You Are Becoming. Connects identity to the code and promise; keeping the existing statement is valid.",
  },
  {
    number: 14,
    slug: "m14",
    title: "Put Your Code to Work",
    stage: "self-trust",
    recommendedTrigger: "honor",
    kind: "action",
    time: "5–10 minutes",
    hook: "Choose one line of your code and act on it today.",
    idea: "A code you don’t use is just words.",
    select: "Acting on your Personal Code turns your standards into how you live. Pick the Scent Trigger that matches the line you act on.",
    action: "Pick one line of your Personal Code. Then take one small action today that puts it to work.",
    choices: [
      "Live your Honor line: correct a mistake or make a fair call.",
      "Live your Courage line: ask for something or speak up respectfully.",
      "Live your Commitment line: finish a small task you promised.",
    ],
    prompt: "Which code line did you act on today, and what did you do?",
    examples: [
      "My line is to own my mistakes. I corrected an update I’d sent with the wrong numbers.",
      "My line is to follow through. I made the call I’d promised.",
    ],
    starters: [
      "I acted on my Honor line by ",
      "I acted on my Courage line by ",
      "I acted on my Commitment line by ",
    ],
    doneWhen: "You can name the line and the action you took.",
    note: "If the action happens later today, save a draft. Come back when it’s done.",
    youtubeId: null,
    implementation: "Requires all five saved code lines (Missions 2, 3, 4, 11 and 12). Practices one line before the wider application stage.",
    rationale: "Previous title: Your Personal Code. Requires the record to name both the code line and the action that practiced it.",
  },
  {
    number: 15,
    slug: "m15",
    title: "Make Room for Someone",
    stage: "values",
    recommendedTrigger: "courage",
    kind: "action",
    time: "3–5 minutes",
    hook: "The people who matter deserve a real place in your week.",
    idea: "If you don’t plan time for the people who matter, they get whatever is left of your week.",
    select: "Courage means reaching out first instead of waiting for them to make the time.",
    action: "Set up one specific time to give someone your full attention.",
    choices: [
      "Suggest a call with a friend and block the time in your calendar.",
      "Agree on a short walk or talk with someone close to you.",
      "Ask a family member when you can spend time together without distractions.",
    ],
    prompt: "Who did you reach out to, and what time did you set up or suggest?",
    examples: [
      "I asked my brother about a call on Thursday. I’m holding 7 PM until he replies.",
      "My partner and I agreed on a walk on Sunday. I put it in my calendar.",
    ],
    starters: [
      "I asked my ",
      "I set up a call with ",
      "I agreed on a walk with ",
    ],
    doneWhen: "You’ve reached out and set or agreed on a time.",
    note: "If they haven’t said yes yet, call it a suggestion. This mission is about setting up the time. The call or visit comes later.",
    youtubeId: "NGi4l1rNc50",
    implementation: "Show the saved promise when available. Completion is contacting someone and reserving time, not attending the event.",
    rationale: "Previous title: Make Time for Them. Adds contact with the other person and distinguishes proposed time from an agreed meeting.",
  },
  {
    number: 16,
    slug: "m16",
    title: "Support the Man Doing the Work",
    stage: "values",
    recommendedTrigger: "honor",
    kind: "action",
    time: "2–10 minutes",
    hook: "You can’t lead well running on empty. Take care of the man doing the work.",
    idea: "Looking after yourself is part of the work. It’s not a break from it.",
    select: "Honor includes respecting yourself enough to take care of the man who has to keep his word.",
    action: "Notice one basic need you’ve ignored today. Take one small step to take care of it.",
    choices: [
      "Take a short movement break that suits your body.",
      "Step away from screens for a few quiet minutes.",
      "Make and eat the meal you’ve been putting off.",
    ],
    prompt: "What did you need, and what did you do about it?",
    examples: [
      "I’d worked without a break. I stepped outside for five quiet minutes.",
      "I’d skipped lunch. I stopped and ate before getting back to work.",
    ],
    starters: [
      "I had worked without a break, so I ",
      "I had skipped a meal, so I ",
      "I needed time away from screens, so I ",
    ],
    doneWhen: "You took the step. Planning it doesn’t count.",
    note: "Do what suits your needs and your body. The goal is effort you can keep up, not pushing through exhaustion.",
    youtubeId: "co2ZBwcMsjM",
    implementation: "Show the promise when available. Builds capacity for focus without prescribing a universal fitness or health target.",
    rationale: "Previous title: Respect Your Body. Connects basic self-care to capacity for sustained effort; offers accessible alternatives.",
  },
  {
    number: 17,
    slug: "m17",
    title: "Finish One Focused Block",
    stage: "values",
    recommendedTrigger: "commitment",
    kind: "action",
    time: "2–10 minutes",
    hook: "Being busy is easy. Give your top priority your full attention.",
    idea: "Ten minutes of full focus on what matters usually beats an hour of half attention.",
    select: "Commitment means giving your goal real time, even if you don’t finish the whole project.",
    action: "Set a timer for ten minutes. Work on one task that moves your goal forward until the timer goes off.",
    choices: [
      "Write or build one small part of an important project.",
      "Work through one section of a skill you’re learning.",
      "Finish a practical task for a responsibility you care about.",
    ],
    prompt: "What did you work on, and what progress did you make?",
    examples: [
      "I spent ten minutes on the start of my proposal and finished one paragraph.",
      "I practiced the first exercise in my course for ten minutes straight.",
    ],
    starters: [
      "I worked on ",
      "I spent ten minutes learning ",
      "I finished part of ",
    ],
    doneWhen: "You finished the ten minutes and can name what you worked on.",
    note: "If ten minutes isn’t possible today, do two minutes on purpose and record that honestly. Mission 6 was about getting started. This one is about staying with it.",
    youtubeId: "8UbE1PcGqC0",
    implementation: "Show the promise when available. Requires doing the timed work; planning a work block does not complete it.",
    rationale: "Previous title: Do the Important Thing. Replaces another start with a focused work interval and a concrete progress record.",
  },
  {
    number: 18,
    slug: "m18",
    title: "Face One Useful Fact",
    stage: "values",
    recommendedTrigger: "courage",
    kind: "action",
    time: "5–10 minutes",
    hook: "You make better decisions when you know the truth.",
    idea: "You can’t fix what you won’t look at.",
    select: "Courage means looking at the facts before you decide what to do.",
    action: "Look at one thing you’ve been avoiding, like a bill, a bank balance or a test score. Find one fact.",
    choices: [
      "Look at a bank statement or a list of subscriptions you’ve been avoiding.",
      "Compare your calendar with the goal you say matters most.",
      "Read feedback, or check where an unfinished project really stands.",
    ],
    prompt: "What did you look at, and what fact or next step did you find?",
    examples: [
      "I checked my calendar and found no time for my course. I need to block out time to study.",
      "I went through my subscriptions and found one I don’t use. I’ll check how to cancel it.",
    ],
    starters: [
      "I reviewed my ",
      "I checked my calendar and found ",
      "I checked the status of ",
    ],
    doneWhen: "You’ve looked at the facts and named what they tell you.",
    note: "Write down the lesson, not account numbers, balances or other private details. You don’t need to make a big decision today.",
    youtubeId: "GqQmxeLr6GI",
    implementation: "Show the promise when available. Makes the next decision better informed without requiring a major decision now.",
    rationale: "Previous title: Face the Numbers. Broadens money avoidance into checking useful facts about the user’s actual priority.",
  },
  {
    number: 19,
    slug: "m19",
    title: "Make Your Priority Easier",
    stage: "values",
    recommendedTrigger: "commitment",
    kind: "action",
    time: "2–5 minutes",
    hook: "Set up your space so the right action is easy to start.",
    idea: "Willpower runs out. Your surroundings don’t.",
    select: "Commitment includes setting yourself up to follow through.",
    action: "Remove one obstacle from the place where you work on your goal. Make your next step easier to start.",
    choices: [
      "Clear just enough space for the task you need to do.",
      "Put what you need for your next session within reach.",
      "Set up a spot for a real conversation or time together, with no distractions.",
    ],
    prompt: "What did you change, and what will it make easier?",
    examples: [
      "I cleared my desk and left my course notes on it, so I can study after breakfast.",
      "I put the items I borrowed by the door, so I’ll return them next time I head out.",
    ],
    starters: [
      "I cleared ",
      "I put my ",
      "I set up a place for ",
    ],
    doneWhen: "One obstacle is gone, or one setup is ready.",
    note: "This is about helping your goal, not cleaning your whole house. You can add a photo of the change if you want.",
    photo: true,
    youtubeId: null,
    implementation: "Show the promise when available. Connect the setup to a priority; an optional photo never substitutes for the action.",
    rationale: "Previous title: Fix Your Space. Replaces random tidying with removing an obstacle to a chosen action.",
  },
  {
    number: 20,
    slug: "m20",
    title: "Be Useful on Purpose",
    stage: "values",
    recommendedTrigger: "honor",
    kind: "action",
    time: "3–10 minutes",
    hook: "Respect shows when you actually help.",
    idea: "A small bit of real help beats a big offer you never follow through on.",
    select: "Honor means helping in a way that respects what the other person needs and wants.",
    action: "Give one small piece of help you can finish today.",
    choices: [
      "Send something useful to answer a question someone asked.",
      "Take on a small shared job that you can fairly handle.",
      "Offer a quick hand, and help if they say yes.",
    ],
    prompt: "Who did you help, and what did they need?",
    examples: [
      "My coworker asked for a template, so I found the right one and sent it.",
      "My neighbor said yes when I offered to carry a box, so I carried it inside.",
    ],
    starters: [
      "I sent ",
      "I took on ",
      "I helped ",
    ],
    doneWhen: "You’ve actually helped. An offer to help later doesn’t count yet.",
    note: "Keep your help welcome and small enough to finish. If someone says no, respect it and help someone else.",
    youtubeId: "oU7fHhMoXoY",
    implementation: "Show the promise when available. Adds a useful contribution before reviewing what the user wants to pursue next.",
    rationale: "Previous title: Be Useful. Makes service specific, useful, welcome, and complete within the user’s control.",
  },
  {
    number: 21,
    slug: "m21",
    title: "Choose One Direction",
    stage: "values",
    recommendedTrigger: "commitment",
    kind: "plan",
    time: "3–5 minutes",
    hook: "Use what you’ve learned to decide where your effort goes next.",
    idea: "Spend the next seven days on one result and see what you can do.",
    select: "Commitment means putting your effort into one goal you chose for a reason.",
    action: "Pick one focus area and one result you can see in the next seven days.",
    choices: [
      "Keep working on the goal you chose in Mission 12.",
      "Shrink a big goal down to one result you can reach in seven days.",
      "Change direction based on something your recent actions taught you.",
    ],
    prompt: "In the next seven days, I want to ____. This matters because ____.",
    examples: [
      "I want to finish the first lesson of my course this week, because it moves my certification forward.",
      "I want to have two real conversations with people close to me, because I’ve been distracted.",
    ],
    starters: [
      "In the next seven days, I want to keep working on ",
      "In the next seven days, I want to finish ",
      "In the next seven days, I want to ",
    ],
    doneWhen: "Your focus area and seven-day aim are saved.",
    note: "Your focus and aim will show up in the next missions. Saving the plan doesn’t mean the result has happened yet.",
    youtubeId: null,
    implementation: "Show promise and recent actions. Require one of the six focus areas plus a seven-day aim; this feeds Missions 22–25.",
    rationale: "Previous title: Pick Your One Area. Adds a visible seven-day aim and a reason to the existing six-area focus choice.",
  },
  {
    number: 22,
    slug: "m22",
    title: "Take the Step You Keep Putting Off",
    stage: "momentum",
    recommendedTrigger: "courage",
    kind: "action",
    time: "2–10 minutes",
    hook: "Bring courage to the direction you chose.",
    idea: "The step you keep putting off is usually the one that matters most.",
    select: "Courage helps your aim get past that first moment when you want to quit.",
    action: "Find the small step you most want to avoid. Then take a small version of it now.",
    choices: [
      "Ask for the information or help you need to move forward.",
      "Start the small part you keep putting off.",
      "Make a clear, respectful request that moves your aim forward.",
    ],
    prompt: "What step did you take, and what discomfort did you push through?",
    examples: [
      "For my course, I asked the teacher about an exercise I didn’t understand.",
      "For my relationships, I called the friend I’d felt bad about ignoring.",
    ],
    starters: [
      "For my aim, I asked ",
      "For my aim, I finally started ",
      "For my aim, I made a request to ",
    ],
    doneWhen: "You took a real step toward your aim, even if the result is still ahead.",
    note: "Pick everyday discomfort that’s worth it. If the step is too big, shrink it until you can take it safely today.",
    youtubeId: null,
    implementation: "Require Mission 21 with a usable aim. Show the saved focus and aim. Complete a step that actually serves that direction.",
    rationale: "Previous title: One Thing Beats Nothing. Uses the saved aim and asks for the uncomfortable step that advances it.",
  },
  {
    number: 23,
    slug: "m23",
    title: "Set Up Your Next Step",
    stage: "momentum",
    recommendedTrigger: "commitment",
    kind: "action",
    time: "2–5 minutes",
    hook: "Get ready for next time while the lesson is fresh.",
    idea: "The best time to get ready for your next step is right after this one.",
    select: "Commitment gets easier when starting again takes less effort.",
    action: "Prepare something now that makes your next step easier. Decide when you’ll use it.",
    choices: [
      "Open what you’ll need for your next work session.",
      "Block out a short time and put what you need where you’ll see it.",
      "Set up the place or gear for your next practice.",
    ],
    prompt: "What did you get ready, and when will you use it?",
    examples: [
      "I opened lesson two and left my notebook out. I’ll use them after breakfast.",
      "I booked a time for the call and wrote down the question I want to ask.",
    ],
    starters: [
      "I opened ",
      "I reserved time for ",
      "I got ready for ",
    ],
    doneWhen: "Everything is ready, and you’ve named when you’ll start.",
    note: "This mission is about getting ready. Record the practice itself when you do it.",
    youtubeId: null,
    implementation: "Require the same saved aim from 21. Distinguish completed preparation from the future practice it supports.",
    rationale: "Previous title: Get 1 Percent Better. Replaces the unmeasured 1% claim with preparing the next repetition of the same aim.",
  },
  {
    number: 24,
    slug: "m24",
    title: "Protect Your Yes",
    stage: "momentum",
    recommendedTrigger: "honor",
    kind: "action",
    time: "2–10 minutes",
    hook: "Saying yes to what matters sometimes means a respectful no.",
    idea: "A respectful no is how you keep your word to what matters.",
    select: "Honor means keeping your word to what matters, even when that takes a respectful no.",
    action: "Find one request or distraction that’s getting in the way of your seven-day aim. Say no to it, push it back or limit it today.",
    choices: [
      "Politely say no to an extra request you don’t have time for.",
      "Offer a later time for something that can wait.",
      "Stop a distraction and use that time for your aim.",
    ],
    prompt: "What did you say no to or limit, and what did it protect?",
    examples: [
      "I skipped an optional meeting so I could finish my study session.",
      "I stopped scrolling and used ten minutes to set up a call with my brother.",
    ],
    starters: [
      "I declined ",
      "I moved ",
      "I stopped ",
    ],
    doneWhen: "You decided and acted on it.",
    note: "Protect your aim, but keep your other responsibilities. This isn’t about saying no to everything or controlling anyone else.",
    youtubeId: "VkA4H2mZNII",
    implementation: "Require the same saved aim from 21. Make an actual decision today; writing a hypothetical boundary is insufficient.",
    rationale: "Previous title: Protect What Matters. Practices a respectful boundary or decision in the moment, tied to a chosen aim.",
  },
  {
    number: 25,
    slug: "m25",
    title: "Shut Down One Distraction",
    stage: "momentum",
    recommendedTrigger: "courage",
    kind: "action",
    time: "About 3 minutes",
    hook: "Fix the interruption that keeps stealing your time.",
    idea: "The same distraction every day adds up to hours. Fix it once at the source.",
    select: "Courage includes giving up an easy comfort to protect what matters.",
    action: "Change one setting or one part of your space so a distraction is less likely to interrupt you.",
    choices: [
      "Turn off notifications you don’t need during your practice time.",
      "Put your phone out of reach for a work session or a conversation.",
      "Close tabs you don’t need and keep only what you’ll use next.",
    ],
    prompt: "What distraction did you cut back, and what did you change?",
    examples: [
      "I muted social media alerts while I study. I left important calls on.",
      "I moved my phone charger away from the dinner table so I can be present.",
    ],
    starters: [
      "I silenced ",
      "I moved my phone ",
      "I closed ",
    ],
    doneWhen: "One change is in place. You’re not saying the habit is gone for good.",
    note: "Mission 24 was a choice in the moment. This mission fixes a repeat interruption at its source.",
    youtubeId: "CiNTVRxOgyY",
    implementation: "Require the same saved aim from 21. Change a recurring condition, rather than repeating only today’s decision in 24.",
    rationale: "Previous title: Cut the Dead Weight. Distinguishes redesigning a recurring distraction from making today’s boundary decision.",
  },
  {
    number: 26,
    slug: "m26",
    title: "Recover Without Excuses",
    stage: "momentum",
    recommendedTrigger: "honor",
    kind: "action",
    time: "2–10 minutes",
    hook: "When you slip, take an honest next step.",
    idea: "Everyone slips. What builds trust is how fast you get back on track.",
    select: "Honor means owning your part. Getting back to work rebuilds trust.",
    action: "Name one recent slip without beating yourself up. Then take the smallest step to start again today.",
    choices: [
      "Restart a practice you missed, for a short amount of time.",
      "Admit a commitment you missed and fix part of it now.",
      "If you haven’t slipped lately, finish a small task you left undone.",
    ],
    prompt: "What slipped, and what did you do to fix it or start again?",
    examples: [
      "I missed my last study session. I did five focused minutes today.",
      "I hadn’t made a call I promised. I said sorry for the delay and made the call.",
    ],
    starters: [
      "I missed ",
      "I had not ",
      "I left ",
    ],
    doneWhen: "You took a step to fix it or start again. Explaining why you slipped isn’t enough.",
    note: "Your progress stays. Missing a day doesn’t mean starting the 30 missions over.",
    youtubeId: null,
    implementation: "Show aim if available. Preserve all prior progress. A completed repair or restart is required, not a self-judgment.",
    rationale: "Previous title: What Would He Do. Replaces another broad identity prompt with honest recovery and a completed repair or restart.",
  },
  {
    number: 27,
    slug: "m27",
    title: "Build a Practice You Can Keep",
    stage: "momentum",
    recommendedTrigger: "commitment",
    kind: "plan",
    time: "5 minutes",
    hook: "Plan your next repeat before your motivation fades.",
    idea: "Tie your practice to something you already do. Add a smaller backup for bad days.",
    select: "Commitment gets practical when you know when to start, what to do and what to do on a bad day. Pick the Scent Trigger you’ll use as your cue.",
    action: "Write when you’ll start, what you’ll do and a smaller backup for a hard day.",
    choices: [
      "Use something you do every day as the signal to start a short practice.",
      "Use a set time each week to follow through with someone.",
      "Use a regular work session to move a big project forward.",
    ],
    prompt: "After ____, I will ____. If that is not possible, I will ____.",
    examples: [
      "After breakfast, I will study for ten minutes. On a hard day, I will do one exercise.",
      "After Sunday lunch, I will call my brother. If we can’t talk, I will send a message and set up another time.",
    ],
    starters: [
      "After breakfast, I will ",
      "After dinner, I will ",
      "Every Sunday, I will ",
    ],
    doneWhen: "Your practice, start cue and backup are saved, along with how often and your review date.",
    note: "Set how often and the review date below. This saves your plan. Each time you do it, record it as an action.",
    youtubeId: "QZQjcgh26jA",
    implementation: "Show aim if available, or choose a priority now. Require frequency and future review date. This creates the later practice context.",
    rationale: "Previous title: Make One Real Commitment. Adds a starting cue and fallback to the existing action, frequency, and review-date plan.",
  },
  {
    number: 28,
    slug: "m28",
    title: "Repeat What Worked",
    stage: "momentum",
    recommendedTrigger: "courage",
    kind: "action",
    time: "Time varies",
    hook: "Build confidence by doing it again.",
    idea: "The second time proves the first wasn’t luck.",
    select: "Courage grows when you keep doing useful actions, even while you still feel unsure.",
    action: "Pick one action from your Proof Log. Then repeat a small version of it today.",
    choices: [
      "Repeat a request or conversation that felt uncomfortable before.",
      "Repeat a focused session that moved an important goal forward.",
      "Repeat a small act of follow-through that made you more dependable.",
    ],
    prompt: "What did you repeat, and what did you notice this time?",
    examples: [
      "I asked another question in my course. It still felt awkward, but I got the answer I needed.",
      "I did another ten-minute study session. Having my notes ready helped.",
    ],
    starters: [
      "I asked another ",
      "I did another ten-minute block on ",
      "I followed through again on ",
    ],
    doneWhen: "You repeated an action and recorded what happened.",
    note: "Use your log as proof of your progress. Don’t compare yourself with other men. Pick the Scent Trigger that matches the action.",
    youtubeId: null,
    implementation: "Require a prior completed action other than 28. Show recent actions and available aim/practice. Selecting a record is not repeating it.",
    rationale: "Previous title: Review the Evidence. Repeats a useful action from the log and records what the user noticed, rather than claiming confidence.",
  },
  {
    number: 29,
    slug: "m29",
    title: "Share Your Code With Someone You Trust",
    stage: "momentum",
    recommendedTrigger: "honor",
    kind: "action",
    time: "3–10 minutes",
    hook: "Let someone you trust know what you’re working on.",
    idea: "A standard someone else knows about is easier to keep.",
    select: "Honor means being clear about the standards you live by.",
    action: "Share one line of your Personal Code with someone you trust. Then ask how they can support you.",
    choices: [
      "Tell a trusted friend which line you’re working on and why.",
      "Read a line to someone close to you and explain the action behind it.",
      "Send a line to a mentor you trust and tell them what you’re practicing.",
    ],
    prompt: "Who did you share your Personal Code with, and what did you tell them you’re working on?",
    examples: [
      "I told my brother my Commitment line and explained my ten-minute study practice.",
      "I shared my Honor line with a close friend. I told him I’m working on owning my mistakes fast.",
    ],
    starters: [
      "I told ",
      "I read my ",
      "I sent my ",
    ],
    doneWhen: "You actually told them your line and your practice.",
    note: "Share only what you’re comfortable sharing, with someone you trust. Copying the text alone doesn’t complete the mission. If the talk has to wait, save a draft.",
    youtubeId: null,
    implementation: "Require all five saved code lines. Show the code and a way to select lines for sharing. Do not automatically send or publish anything.",
    rationale: "Previous title: Share Your Personal Code. Explains a selected standard and its practical behavior to a trusted person; no public disclosure is required.",
  },
  {
    number: 30,
    slug: "m30",
    title: "Carry Your Momentum Forward",
    stage: "momentum",
    recommendedTrigger: "courage",
    kind: "plan",
    time: "5–10 minutes",
    hook: "Take what worked with you into the next month.",
    idea: "Thirty missions are a start, not a finish.",
    select: "Courage means keeping going by your own choice, with no mission telling you what to do next.",
    action: "Keep or adjust one practice for the next 30 days.",
    choices: [
      "Keep a practice that worked and make next month realistic.",
      "Shrink a practice that was too big so you can repeat it more often.",
      "Use a lesson from your log on a different goal that matters more now.",
    ],
    prompt: "I learned ____. After ____, I will ____. If I miss, I will ____.",
    examples: [
      "I learned mornings work best. After breakfast, I’ll study for ten minutes. If I miss, I’ll do one exercise the next chance I get.",
      "I learned short calls are easier to keep. After Sunday lunch, I’ll call someone close to me. If we can’t connect, I’ll set up another time.",
    ],
    starters: [
      "I learned ",
      "I learned mornings work best. After breakfast, I will ",
      "I learned I took on too much. After ",
    ],
    doneWhen: "Your next practice, Scent Trigger, how often and review date are saved.",
    note: "Use Activate to record each time you do it. Your code, missions and Proof Log stay with you. Thirty missions build the start of a habit. Keep going to make it last.",
    youtubeId: null,
    implementation: "Show recent actions and any aim/practice. Require frequency and future review date. Future repetitions go into Activate.",
    rationale: "Previous title: Choose the Next Mission. Uses evidence and the earlier plan to choose what to keep or adjust for the next month.",
  },
];

export function getMissionDef(number: number): MissionDef | undefined {
  return MISSIONS.find((mission) => mission.number === number);
}

export function stageOf(def: MissionDef) {
  return STAGES[def.stage];
}
