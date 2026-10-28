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
    "self-trust": { label: "Build self-trust", range: [1, 7] },
    standards: { label: "Set your standards", range: [8, 14] },
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
  /** The Select step: why this value fits this Mission. */
  select: string;
  /** The Act step: the assignment. */
  action: string;
  /** "Choose one way to do it": three equal approaches, not a quiz. */
  choices: [string, string, string];
  /** The Record step's question. */
  prompt: string;
  /** "Need an example?": inspiration only. Never fills the field. */
  examples: [string, string];
  doneWhen: string;
  note?: string;
  /** Optional photo (Missions 7 and 19 only). */
  photo?: boolean;
  /** Optional, collapsed, never required. */
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
    Missions 8–10. */
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
    slug: "m1",
    title: "Give Credit Where It Is Due",
    stage: "self-trust",
    recommendedTrigger: "honor",
    kind: "action",
    time: "About 2 minutes",
    hook: "Start by noticing what someone else has done for you.",
    select: "Honor means recognizing other people’s contributions and treating them with respect.",
    action: "Tell one person exactly what they did that you appreciate and why it mattered. Send the message or say it to them today.",
    choices: [
      "Thank someone close to you for a specific way they supported you.",
      "Give a coworker credit for something they made easier.",
      "Thank someone whose everyday effort you usually take for granted.",
    ],
    prompt: "Who did you thank, and what did you tell them?",
    examples: [
      "I thanked my brother for checking in while I was having a rough week.",
      "I told my coworker her careful handover helped me finish the job.",
    ],
    doneWhen: "You have expressed the appreciation. Thinking it or drafting it is preparation.",
    youtubeId: null,
    implementation: "Opens with an achievable act of respect. Supplies a concrete experience for the Honor line in Mission 8.",
    rationale: "Previous title: Prove It. Keeps the quick first win, but makes respect and giving credit its explicit purpose.",
  },
  {
    number: 2,
    slug: "m2",
    title: "Break the Avoidance Loop",
    stage: "self-trust",
    recommendedTrigger: "courage",
    kind: "action",
    time: "2–5 minutes",
    hook: "Make the thing you are avoiding smaller than the excuse.",
    select: "Courage means moving toward a worthwhile task while discomfort is still there.",
    action: "Choose one useful task you have delayed because it feels uncomfortable. Take its first concrete step now. Keep the step small enough to finish in five minutes.",
    choices: [
      "Send the straightforward email you have been putting off.",
      "Request an appointment you have delayed.",
      "Complete the first section of a necessary form.",
    ],
    prompt: "What were you avoiding, and what first step did you take?",
    examples: [
      "I was avoiding the repair call. I called and requested an estimate.",
      "I was dreading the application. I completed the contact section.",
    ],
    doneWhen: "One real step is finished. The whole task does not have to be.",
    note: "Choose an ordinary, manageable task. This mission is about useful discomfort, not taking unnecessary risks.",
    youtubeId: null,
    implementation: "Adds useful discomfort after the first win. Later Missions 17 and 22 develop sustained focus and goal-directed courage.",
    rationale: "Previous title: Stop Putting It Off. Defines a manageable avoided task and requires a real first step.",
  },
  {
    number: 3,
    slug: "m3",
    title: "Keep One Small Promise",
    stage: "self-trust",
    recommendedTrigger: "commitment",
    kind: "action",
    time: "Time varies",
    hook: "Give yourself a reason to trust your own word.",
    select: "Commitment turns an intention into something another person—or you—can rely on.",
    action: "Keep one small promise you have made to yourself or someone else. Choose one you can fulfill today; if you have none, make a small promise and carry it out now.",
    choices: [
      "Return a call or message when you said you would.",
      "Finish a small responsibility you agreed to handle.",
      "Keep a modest promise to yourself, such as five minutes on a neglected task.",
    ],
    prompt: "What did you promise, and how did you follow through?",
    examples: [
      "I promised to return the borrowed drill today, and I dropped it off.",
      "I promised myself five minutes on the paperwork, and I completed that time.",
    ],
    doneWhen: "The promise has been kept. A promise for later stays a draft.",
    youtubeId: null,
    implementation: "Adds follow-through to the first two values. Prepares the continuing promise in Mission 12.",
    rationale: "Previous title: Keep Your Word. Distinguishes making a promise from fulfilling it; offers a route when no promise is pending.",
  },
  {
    number: 4,
    slug: "m4",
    title: "Own Your Part",
    stage: "self-trust",
    recommendedTrigger: "honor",
    kind: "action",
    time: "5–10 minutes",
    hook: "Self-respect includes admitting when you got something wrong.",
    select: "Honor means owning your conduct without passing blame or demanding forgiveness.",
    action: "Choose one small mistake or overlooked responsibility that is yours. Acknowledge it plainly and take a practical step to put it right.",
    choices: [
      "Correct inaccurate information you gave someone and tell them what changed.",
      "Acknowledge a missed responsibility and complete a useful part of it.",
      "Apologize for a specific inconsiderate act and make a small repair.",
    ],
    prompt: "What did you take responsibility for, and what did you do to repair it?",
    examples: [
      "I told my coworker I had sent the wrong date and sent the corrected details.",
      "I owned leaving the kitchen for someone else and cleaned it.",
    ],
    doneWhen: "You have acknowledged your part and made a repair within your control.",
    note: "Choose an everyday situation that is safe to address. You do not need to disclose private details in your log or obtain anyone’s forgiveness.",
    youtubeId: null,
    implementation: "Extends respect into accountability. Supplies a practical repair model for Missions 8, 11, and 26.",
    rationale: "Previous title: Honor Someone Who Matters. Replaces the second gratitude task with accountability and a practical repair.",
  },
  {
    number: 5,
    slug: "m5",
    title: "Ask Instead of Pretending",
    stage: "self-trust",
    recommendedTrigger: "courage",
    kind: "action",
    time: "2–5 minutes",
    hook: "You do not need every answer to take the next step.",
    select: "Courage includes letting yourself be a beginner and admitting what you need.",
    action: "Ask one clear question or request one specific piece of help with something that matters to you.",
    choices: [
      "Ask someone to explain a part of a task you do not understand.",
      "Request feedback on one specific piece of work.",
      "Ask a trusted person for a manageable piece of practical help.",
    ],
    prompt: "What did you ask, and what uncertainty did you face?",
    examples: [
      "I asked my colleague to explain the step I had been pretending to understand.",
      "I asked a friend to look over the opening of my presentation.",
    ],
    doneWhen: "You have made the request. A reply or a yes is not required.",
    youtubeId: null,
    implementation: "Makes asking for help a legitimate expression of courage. Informs the Courage line and later goal work.",
    rationale: "Previous title: Act Before You Are Ready. Replaces another generic start with the distinct skill of asking for help or feedback.",
  },
  {
    number: 6,
    slug: "m6",
    title: "Remember Your Own Strength",
    stage: "self-trust",
    recommendedTrigger: "honor",
    kind: "reflection",
    time: "3–5 minutes",
    hook: "Use something real when doubt tells you who you are.",
    select: "An honest memory gives you a concrete example of a value you have already practiced.",
    action: "Recall one specific time you acted with honor, courage, or commitment. Name the difficulty, what you actually did, and the quality you want to use again.",
    choices: [
      "Recall telling the truth when hiding it would have been easier.",
      "Recall taking a worthwhile step while you were nervous.",
      "Recall continuing a responsibility during a difficult period.",
    ],
    prompt: "What happened, what did you do, and what does it remind you you can do?",
    examples: [
      "I admitted a missed deadline and helped fix the problem. I can own my part when I feel embarrassed.",
      "I kept visiting my dad during a hard month. I can keep showing up.",
    ],
    doneWhen: "You have recorded one specific memory and the quality you want to use again.",
    note: "Select the fragrance that matches the memory. This is a reflection on the past, recorded separately from a new action today.",
    youtubeId: null,
    implementation: "Uses one real memory as evidence before writing standards. It does not increase the action count.",
    rationale: "Previous title: Remember Who You Have Been. Keeps reflection, but asks for a specific event, behavior, and reusable quality.",
  },
  {
    number: 7,
    slug: "m7",
    title: "Give Your Practice a Place",
    stage: "self-trust",
    recommendedTrigger: "commitment",
    kind: "action",
    time: "About 2 minutes",
    hook: "A useful reminder belongs where your day already happens.",
    select: "Commitment is easier to practice when you have a dependable place and starting cue.",
    action: "Place your fragrance where it can remind you to practice, away from heat and direct sunlight. Choose the everyday event that will prompt you to open your next mission.",
    choices: [
      "Put it by your watch and begin after getting dressed.",
      "Put it on a shaded bedroom shelf and begin before leaving the room.",
      "Put it with your morning essentials and begin after making your bed.",
    ],
    prompt: "Where did you put it, and after what everyday event will you begin?",
    examples: [
      "I put Honor beside my watch. After getting dressed, I will open the next mission.",
      "I put the set on my bedroom shelf. After making my bed, I will begin.",
    ],
    doneWhen: "The bottle is in place and you have named your starting cue.",
    note: "Use a safe, appropriate place. One bottle is enough to set up your reminder. A photo is optional; setting up the cue does not mean future practice is complete.",
    photo: true,
    youtubeId: "GCpsEfFp_E8",
    implementation: "Completes the first stage with a physical cue and daily starting event. Mission 27 later adds a repeatable practice.",
    rationale: "Previous title: Put Your Reminder Where You Will See It. Links a visible fragrance cue to an existing daily event, rather than merely arranging a bottle.",
  },
  {
    number: 8,
    slug: "m8",
    title: "Define Your Honor",
    stage: "standards",
    recommendedTrigger: "honor",
    kind: "code",
    time: "3–5 minutes",
    hook: "Write a standard you can recognize in your own behavior.",
    select: "Your Personal Code begins with a practical standard for integrity and respect.",
    action: "Finish “For me, honor means…” with one behavior you want to stand by. Make it specific enough that you could tell whether you lived it today.",
    choices: [
      "Use honesty: describe how you will tell the truth.",
      "Use responsibility: describe how you will own your part.",
      "Use respect: describe how you will treat someone who cannot benefit you.",
    ],
    prompt: "For me, honor means…",
    examples: [
      "Telling the truth about my mistakes and taking responsibility for repairing them.",
      "Giving people credit for their work, even when I could take it myself.",
    ],
    doneWhen: "One clear Honor line is saved to your Personal Code.",
    note: "This defines your standard. You will practice a code line in Mission 14; saving words does not prove you have lived them.",
    youtubeId: "a9yG3pylUKY",
    implementation: "Uses early experience to define Honor. Creates code line 1, required with lines 9–12 for Missions 14 and 29.",
    rationale: "Previous title: Honor in Your Words. Turns an abstract value definition into an observable standard.",
  },
  {
    number: 9,
    slug: "m9",
    title: "Define Your Courage",
    stage: "standards",
    recommendedTrigger: "courage",
    kind: "code",
    time: "3–5 minutes",
    hook: "Name the useful action fear tends to stop.",
    select: "A concrete Courage line gives you direction when avoidance becomes tempting.",
    action: "Finish “For me, courage means…” with a worthwhile behavior you want to practice even when you feel uncomfortable.",
    choices: [
      "Name a respectful conversation you tend to avoid.",
      "Name a situation where you need to ask for help.",
      "Name a useful first step you delay because you might be judged.",
    ],
    prompt: "For me, courage means…",
    examples: [
      "Asking for help when I am stuck instead of pretending I understand.",
      "Speaking honestly and respectfully when I disagree.",
    ],
    doneWhen: "One clear Courage line is saved to your Personal Code.",
    note: "Courage serves a worthwhile purpose. Your line should not require danger, hostility, or ignoring sound judgment.",
    youtubeId: "NCeKnEezPWs",
    implementation: "Turns earlier avoidance and asking exercises into a standard. Creates code line 2.",
    rationale: "Previous title: Courage in Your Words. Names worthwhile discomfort and a behavior, with no encouragement to take reckless risks.",
  },
  {
    number: 10,
    slug: "m10",
    title: "Define Your Commitment",
    stage: "standards",
    recommendedTrigger: "commitment",
    kind: "code",
    time: "3–5 minutes",
    hook: "Decide what showing up looks like on an ordinary day.",
    select: "Commitment is consistent effort with a way back when life interrupts.",
    action: "Finish “For me, commitment means…” with a repeatable behavior and how you will return to it after a missed opportunity.",
    choices: [
      "Describe showing up for a person who relies on you.",
      "Describe giving a priority regular, protected attention.",
      "Describe returning to a useful practice after missing it.",
    ],
    prompt: "For me, commitment means…",
    examples: [
      "Giving my important work ten focused minutes and returning at the next opportunity if I miss.",
      "Keeping regular time with my family and honestly rescheduling when a real conflict arises.",
    ],
    doneWhen: "One clear Commitment line is saved to your Personal Code.",
    note: "Choose a standard you can practice. “Never fail” gives you no useful way to recover.",
    youtubeId: "ihWgFp5H0DU",
    implementation: "Turns follow-through into a repeatable standard with recovery. Creates code line 3.",
    rationale: "Previous title: Commitment in Your Words. Builds returning after a miss into the definition of commitment.",
  },
  {
    number: 11,
    slug: "m11",
    title: "Draw One Honest Boundary",
    stage: "standards",
    recommendedTrigger: "honor",
    kind: "code",
    time: "3–5 minutes",
    hook: "Decide what you will do when a shortcut tests your values.",
    select: "Honor becomes easier to apply when you have decided how to handle pressure.",
    action: "Name one line you will not cross and the response you will use instead. Keep the boundary about your own behavior.",
    choices: [
      "Replace hiding a mistake with acknowledging it and making a repair.",
      "Replace taking undeserved credit with naming the person who contributed.",
      "Replace agreeing to something you cannot deliver with stating what you can do.",
    ],
    prompt: "I will not ____. Instead, I will ____.",
    examples: [
      "I will not hide a mistake to protect my image. Instead, I will acknowledge it and correct what I can.",
      "I will not promise time I cannot give. Instead, I will offer a realistic commitment.",
    ],
    doneWhen: "Your boundary and the alternative you will use are saved.",
    youtubeId: null,
    implementation: "Adds a usable response to pressure. Creates code line 4 and prepares the boundary practiced in Mission 24.",
    rationale: "Previous title: The Line You Will Not Cross. Adds the behavior to use instead of only naming a prohibition.",
  },
  {
    number: 12,
    slug: "m12",
    title: "Choose the Promise That Matters",
    stage: "standards",
    recommendedTrigger: "commitment",
    kind: "code",
    time: "3–5 minutes",
    hook: "Put one meaningful priority ahead of a list of good intentions.",
    select: "Commitment needs a direction. This promise will guide the practice you build later.",
    action: "Choose one area of your life that matters to you. Define a small, repeatable action in your control that would move it forward, and say why it matters.",
    choices: [
      "Choose connection: give someone you care about regular, undivided attention.",
      "Choose a personal goal: spend a small block of time doing its next useful task.",
      "Choose daily care: repeat one manageable action that supports your wellbeing.",
    ],
    prompt: "My promise is to ____, because ____.",
    examples: [
      "My promise is ten focused minutes on my qualification after breakfast, because I want more options.",
      "My promise is to put my phone away during dinner, because I want to be present with the people I love.",
    ],
    doneWhen: "One meaningful promise is saved, with a behavior you control and a reason.",
    note: "Define the promise today. Future repetitions are still ahead. You can refine the promise as you learn what works.",
    youtubeId: null,
    implementation: "Creates code line 5 and the promise shown in Missions 15–21. This supplies direction for later planning.",
    rationale: "Previous title: The Promise That Matters Most. Establishes a meaningful promise early so later work has a direction.",
  },
  {
    number: 13,
    slug: "m13",
    title: "Name the Man You Are Becoming",
    stage: "standards",
    recommendedTrigger: "courage",
    kind: "code",
    time: "About 3 minutes",
    hook: "Let your identity point to something you can do.",
    select: "Courage includes choosing how you will act before confidence catches up.",
    action: "Read the statement below. Keep it if it fits, or make it more specific using your code and promise.",
    choices: [
      "Describe a man who takes responsibility for his conduct.",
      "Describe a man who faces worthwhile discomfort.",
      "Describe a man who follows through and returns after setbacks.",
    ],
    prompt: "I am becoming a man who…",
    examples: [
      "Keeps his word, admits his mistakes, and makes repairs.",
      "Takes the next useful step even when he feels unsure.",
    ],
    doneWhen: "You have deliberately kept or updated your identity statement.",
    note: "You do not need to claim perfection. Your statement is a direction you are choosing, not a verdict on your worth.",
    youtubeId: null,
    implementation: "Summarizes the code and promise as an identity direction. Save updates profile identity; opening the page does not.",
    rationale: "Previous title: The Man You Are Becoming. Connects identity to the code and promise; keeping the existing statement is valid.",
  },
  {
    number: 14,
    slug: "m14",
    title: "Put Your Code to Work",
    stage: "standards",
    recommendedTrigger: "honor",
    kind: "action",
    time: "5–10 minutes",
    hook: "Give one of your standards a real example.",
    select: "Honor connects the standard you wrote with the way you actually behave.",
    action: "Read your Personal Code below. Choose one line and take one small action today that puts it into practice.",
    choices: [
      "Practice your Honor line through an honest correction or a fair decision.",
      "Practice your Courage line by making a useful request or speaking respectfully.",
      "Practice your Commitment line by completing a small promised action.",
    ],
    prompt: "Which code line did you practice, and what did you do?",
    examples: [
      "My line is to own mistakes. I corrected an inaccurate update I had sent.",
      "My line is to follow through. I completed the call I had promised.",
    ],
    doneWhen: "You can name the code line and the action you have completed.",
    note: "Choose the fragrance that best matches the line you are practicing. If the action is later today, save a draft and return after it happens.",
    youtubeId: null,
    implementation: "Requires all five saved code lines from Missions 8–12. Practices one line before the wider application stage.",
    rationale: "Previous title: Your Personal Code. Requires the record to name both the code line and the action that practiced it.",
  },
  {
    number: 15,
    slug: "m15",
    title: "Make Room for Someone",
    stage: "values",
    recommendedTrigger: "commitment",
    kind: "action",
    time: "3–5 minutes",
    hook: "A person who matters deserves a real place in your week.",
    select: "Commitment makes care practical by giving it time and follow-through.",
    action: "Arrange one specific time to give someone your attention. Ask what works for them and reserve a time you can keep.",
    choices: [
      "Propose a call with a friend and hold the time in your calendar.",
      "Agree on a short walk or conversation with someone close to you.",
      "Ask a family member when you can spend some uninterrupted time together.",
    ],
    prompt: "Who did you contact, and what time did you arrange or propose?",
    examples: [
      "I asked my brother about a Thursday call and held 7 PM while I wait for his reply.",
      "My partner and I agreed on a Sunday walk, and I added it to my calendar.",
    ],
    doneWhen: "You have contacted the person and reserved or agreed on a time.",
    note: "Label a proposal as a proposal. This records arranging time; it does not claim the visit or call has happened.",
    youtubeId: "NGi4l1rNc50",
    implementation: "Show the saved promise when available. Completion is contacting someone and reserving time, not attending the event.",
    rationale: "Previous title: Make Time for Them. Adds contact with the other person and distinguishes proposed time from an agreed meeting.",
  },
  {
    number: 16,
    slug: "m16",
    title: "Support the Man Doing the Work",
    stage: "values",
    recommendedTrigger: "commitment",
    kind: "action",
    time: "2–10 minutes",
    hook: "Your goals need a person with the capacity to pursue them.",
    select: "Commitment includes maintaining your capacity to keep showing up.",
    action: "Notice one basic need you have neglected today. Take one small, appropriate step to care for yourself before your next demanding task.",
    choices: [
      "Take a brief movement break that suits your abilities.",
      "Step away for a quiet screen-free break.",
      "Prepare and have the meal or drink you have been putting off.",
    ],
    prompt: "What did you need, and what did you do to support yourself?",
    examples: [
      "I had worked without a break. I stepped outside for five quiet minutes.",
      "I had skipped lunch. I stopped and ate before returning to the task.",
    ],
    doneWhen: "You have taken the care step, rather than only planning it.",
    note: "Choose what suits your needs and abilities. The goal is sustainable effort, not pushing through exhaustion.",
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
    time: "10 minutes",
    hook: "Busy is easy. Give your priority uninterrupted attention.",
    select: "Commitment means giving your chosen goal real time, even without finishing the whole project.",
    action: "Choose one small task that serves your promise or another important goal. Set a ten-minute timer, remove a distraction, and work on that task until the timer ends.",
    choices: [
      "Write or make one small part of an important project.",
      "Work through one section of material for a skill you are learning.",
      "Complete a practical task that supports a responsibility you value.",
    ],
    prompt: "What did you work on, and what progress did you make?",
    examples: [
      "I spent ten minutes drafting the introduction to my proposal and finished one paragraph.",
      "I practiced the first exercise in my course for ten uninterrupted minutes.",
    ],
    doneWhen: "You have completed the focused block and can name what you worked on.",
    note: "If ten minutes is unrealistic today, use two deliberate minutes and record that honestly. This practices staying with a task; Mission 2 practiced starting it.",
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
    hook: "You can make a better decision when you know what is true.",
    select: "Courage includes looking at reality before deciding what to do.",
    action: "Check one source of information you have avoided about something that matters to you. Identify one fact and the next question or step it suggests.",
    choices: [
      "Review a statement or subscription list you have avoided.",
      "Compare your calendar with the priority you say matters.",
      "Read feedback or check the actual status of an unfinished project.",
    ],
    prompt: "What did you review, and what useful fact or next step did you identify?",
    examples: [
      "I checked my calendar and found no time for my course. I need to reserve a short study block.",
      "I reviewed my subscriptions and found one I no longer use. I will check its cancellation terms.",
    ],
    doneWhen: "You have reviewed the information and named what it tells you.",
    note: "Record the lesson, not private balances, account numbers, or other sensitive details. Reviewing a fact does not require making a major decision today.",
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
    hook: "Arrange your space to support the action you want to take.",
    select: "Commitment includes preparing the conditions for follow-through.",
    action: "Remove one practical obstacle from the place where you will carry out your promise or important task. Make the next useful action easier to begin.",
    choices: [
      "Clear just enough workspace for the task you need to do.",
      "Put the materials for your next practice within reach.",
      "Prepare a place for an undistracted conversation or shared activity.",
    ],
    prompt: "What did you change, and which action will it make easier?",
    examples: [
      "I cleared my work surface and put my course notes there so I can study after breakfast.",
      "I put the borrowed items by the door so I can return them on my next trip.",
    ],
    doneWhen: "One obstacle is removed or one useful setup is ready.",
    note: "The task is to support a priority, not tidy your whole house. An optional photo can show the change.",
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
    hook: "Respect becomes visible when you make a real contribution.",
    select: "Honor includes contributing in a way that respects the other person’s needs and choices.",
    action: "Notice a specific need someone has expressed. Give one small, appropriate piece of help you can complete today, without taking over.",
    choices: [
      "Send a useful resource in response to a question someone asked.",
      "Complete a small shared responsibility that you can legitimately take on.",
      "Offer a brief practical hand and help if the person accepts.",
    ],
    prompt: "Who did you help, and what need did your action address?",
    examples: [
      "My colleague asked for a template, so I found and sent the relevant one.",
      "My neighbor accepted help carrying a box, and I carried it inside.",
    ],
    doneWhen: "You have provided useful help. An offer to help later is still an intention.",
    note: "Keep the help welcome and manageable. If one person declines, respect that and choose another suitable action.",
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
    hook: "Use what you have learned to choose where your effort goes next.",
    select: "Commitment concentrates your effort on a goal you chose for a reason.",
    action: "Review your promise and recent actions. Choose one focus area and one visible result you want to work toward over the next seven days.",
    choices: [
      "Continue the promise you already chose in Mission 12.",
      "Narrow an important goal to one realistic seven-day result.",
      "Adjust your direction using something your recent actions taught you.",
    ],
    prompt: "In the next seven days, I want to ____. This matters because ____.",
    examples: [
      "I want to complete the first lesson of my course this week because it moves my qualification forward.",
      "I want to have two unhurried conversations with people close to me because I have been distracted.",
    ],
    doneWhen: "Your area and a specific seven-day aim are saved.",
    note: "Your focus and aim will appear in the next missions. Saving this plan does not claim the result has happened.",
    youtubeId: null,
    implementation: "Show promise and recent actions. Require one of the six focus areas plus a seven-day aim; this feeds Missions 22–25.",
    rationale: "Previous title: Pick Your One Area. Adds a visible seven-day aim and a reason to the existing six-area focus choice.",
  },
  {
    number: 22,
    slug: "m22",
    title: "Take the Step You Are Avoiding",
    stage: "momentum",
    recommendedTrigger: "courage",
    kind: "action",
    time: "2–10 minutes",
    hook: "Bring courage to the direction you chose.",
    select: "Courage helps your chosen goal survive the first moment of resistance.",
    action: "Read your seven-day aim below. Identify the small step you are most tempted to avoid, and take a manageable version of it now.",
    choices: [
      "Ask for information or help you need to move your aim forward.",
      "Begin the small part you keep postponing.",
      "Make a clear, respectful request connected to your aim.",
    ],
    prompt: "What step served your aim, and what discomfort did you act through?",
    examples: [
      "For my course aim, I asked the tutor about an exercise I did not understand.",
      "For my connection aim, I called the friend I felt awkward about neglecting.",
    ],
    doneWhen: "You have taken a useful step toward the aim, even if the wider result is still ahead.",
    note: "Choose ordinary, worthwhile discomfort. If the step is too large, shrink it until you can take it safely today.",
    youtubeId: null,
    implementation: "Require Mission 21 with a usable aim. Show the saved focus and aim. Complete a step that actually serves that direction.",
    rationale: "Previous title: One Thing Beats Nothing. Uses the saved aim and asks for the uncomfortable step that advances it.",
  },
  {
    number: 23,
    slug: "m23",
    title: "Make Tomorrow Easier",
    stage: "momentum",
    recommendedTrigger: "commitment",
    kind: "action",
    time: "2–5 minutes",
    hook: "Prepare the next repetition while today’s lesson is fresh.",
    select: "Commitment is strengthened by reducing the effort needed to begin again.",
    action: "Using the same seven-day aim, prepare one thing now that will make your next useful action easier. Name when you will use that setup.",
    choices: [
      "Open the exact materials you will need for your next work block.",
      "Reserve a small time slot and put the needed materials beside your usual cue.",
      "Prepare the place or equipment for your next manageable practice.",
    ],
    prompt: "What did you prepare, and when will you use it?",
    examples: [
      "I opened lesson two and left my notebook ready. I will use them after breakfast.",
      "I reserved tomorrow’s call time and wrote down the question I want to ask.",
    ],
    doneWhen: "The setup is ready and the next starting moment is named.",
    note: "This records preparation. Record the next practice separately when you carry it out.",
    youtubeId: null,
    implementation: "Require the same saved aim from 21. Distinguish completed preparation from the future practice it supports.",
    rationale: "Previous title: Get 1 Percent Better. Replaces the unmeasured 1% claim with preparing the next repetition of the same aim.",
  },
  {
    number: 24,
    slug: "m24",
    title: "Protect Your Yes",
    stage: "momentum",
    recommendedTrigger: "courage",
    kind: "action",
    time: "2–10 minutes",
    hook: "A meaningful yes sometimes needs a respectful no.",
    select: "Courage includes tolerating a little discomfort to honor a considered priority.",
    action: "Identify one optional demand or distraction that competes with your seven-day aim. Decline, defer, or limit it today so you can protect time for that aim.",
    choices: [
      "Respectfully decline an optional request you do not have capacity for.",
      "Offer a later time for something that can reasonably wait.",
      "Stop a chosen distraction and use the protected time for your aim.",
    ],
    prompt: "What did you decline or limit, and what priority did that protect?",
    examples: [
      "I declined an optional meeting so I could complete my study block.",
      "I stopped scrolling and used ten minutes to arrange a call with my brother.",
    ],
    doneWhen: "You have made the decision and acted on it.",
    note: "Protect your priority while respecting existing responsibilities. The mission is not to refuse everything or control someone else.",
    youtubeId: "VkA4H2mZNII",
    implementation: "Require the same saved aim from 21. Make an actual decision today; writing a hypothetical boundary is insufficient.",
    rationale: "Previous title: Protect What Matters. Practices a respectful boundary or decision in the moment, tied to a chosen aim.",
  },
  {
    number: 25,
    slug: "m25",
    title: "Remove One Recurring Distraction",
    stage: "momentum",
    recommendedTrigger: "commitment",
    kind: "action",
    time: "About 3 minutes",
    hook: "Fix the interruption that keeps stealing the same time.",
    select: "Commitment includes changing a repeated obstacle instead of relying only on willpower.",
    action: "Choose a recurring distraction that interferes with your seven-day aim. Change one setting or part of your environment so it is less likely to interrupt your next practice.",
    choices: [
      "Silence nonessential notifications during your practice time.",
      "Move your phone out of reach for a focused block or conversation.",
      "Close unrelated tabs and leave only the materials for the next task.",
    ],
    prompt: "Which distraction did you reduce, and what did you change?",
    examples: [
      "I muted social notifications during my study period and kept important calls enabled.",
      "I moved my phone charger away from the dinner table to support being present.",
    ],
    doneWhen: "A specific change is in place. You are not claiming the habit is permanently gone.",
    note: "Mission 24 practiced a decision in the moment. Today you change a recurring interruption at its source.",
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
    hook: "A setback calls for an honest next step.",
    select: "Honor means honest responsibility; returning to the work rebuilds trust.",
    action: "Identify one recent lapse in a promise or priority. Name your part without attacking yourself, then take the smallest useful action to repair or resume it today.",
    choices: [
      "Resume a missed practice for a manageable amount of time.",
      "Acknowledge a missed commitment and complete a useful repair now.",
      "If you have had no recent lapse, finish a small responsibility you left incomplete.",
    ],
    prompt: "What slipped, and what did you do to repair or restart?",
    examples: [
      "I missed my study block yesterday. I completed five focused minutes today.",
      "I had not returned a promised call. I acknowledged the delay and made the call.",
    ],
    doneWhen: "You have taken a repair or restart action. Explaining the lapse alone is not enough.",
    note: "Keep your existing progress. A missed day does not require starting the 30 missions over.",
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
    hook: "Make the next repetition clear before motivation changes.",
    select: "Commitment becomes practical when the cue, action, and recovery option are clear.",
    action: "Turn your seven-day aim—or a priority you choose now—into one repeatable practice. Write when you will start, what you will do, and a smaller fallback for a difficult day.",
    choices: [
      "Use a familiar daily event to start a short practice.",
      "Use a regular weekly time to follow through with someone.",
      "Use a recurring work block to move an important project forward.",
    ],
    prompt: "After ____, I will ____. If that is not possible, I will ____.",
    examples: [
      "After breakfast, I will study for ten minutes. On a difficult day, I will complete one exercise.",
      "After Sunday lunch, I will call my brother. If we cannot talk, I will send a message and arrange another time.",
    ],
    doneWhen: "The practice, starting cue, fallback, frequency, and future review date are saved.",
    note: "Choose the fragrance you intend to use as your cue. The frequency and review date are below. This saves a plan; repetitions are recorded as actions.",
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
    hook: "Build confidence from something you can actually repeat.",
    select: "Courage grows through practicing useful actions even when you still feel uncertain.",
    action: "Read a completed action in your Proof Log below. Choose one that helped you live your code or move a priority forward, then repeat a manageable version today.",
    choices: [
      "Repeat a useful request or conversation you previously found uncomfortable.",
      "Repeat a focused block that moved an important goal forward.",
      "Repeat a small act of follow-through that made you more dependable.",
    ],
    prompt: "What useful action did you repeat, and what did you notice this time?",
    examples: [
      "I asked another clarifying question in my course. I still felt awkward, but I got the answer I needed.",
      "I completed another ten-minute study block. Having the materials ready helped.",
    ],
    doneWhen: "You have repeated a useful action and recorded what happened.",
    note: "Use your log as evidence, not as a comparison with other men. Choose the fragrance that matches the action.",
    youtubeId: null,
    implementation: "Require a prior completed action other than 28. Show recent actions and available aim/practice. Selecting a record is not repeating it.",
    rationale: "Previous title: Review the Evidence. Repeats a useful action from the log and records what the user noticed, rather than claiming confidence.",
  },
  {
    number: 29,
    slug: "m29",
    title: "Let Someone Support Your Standard",
    stage: "momentum",
    recommendedTrigger: "honor",
    kind: "action",
    time: "3–10 minutes",
    hook: "Make it easier for someone you trust to understand what you are practicing.",
    select: "Honor includes being clear about the standards you want your behavior to reflect.",
    action: "Choose one or more lines from your Personal Code. Share them with someone you trust and explain one behavior you are working on.",
    choices: [
      "Tell a trusted friend which code line you are practicing and why.",
      "Read a chosen line to someone close to you and explain the action behind it.",
      "Send a selected line to a trusted mentor and name your current practice.",
    ],
    prompt: "Who did you share with, and what practice did you explain?",
    examples: [
      "I told my brother my Commitment line and explained my ten-minute study practice.",
      "I shared my Honor line with a close friend and said I am working on owning mistakes promptly.",
    ],
    doneWhen: "You have actually communicated the selected line and practice.",
    note: "Share only what you are comfortable sharing, with a safe and trusted person. Copying text alone does not complete the mission. If the conversation must wait, save a draft.",
    youtubeId: null,
    implementation: "Require all five saved code lines. Show the code and a way to select lines for sharing. Do not automatically send or publish anything.",
    rationale: "Previous title: Share Your Personal Code. Explains a selected standard and its practical behavior to a trusted person; no public disclosure is required.",
  },
  {
    number: 30,
    slug: "m30",
    title: "Carry Your Momentum Forward",
    stage: "momentum",
    recommendedTrigger: "commitment",
    kind: "plan",
    time: "5–10 minutes",
    hook: "Take what worked with you into the next month.",
    select: "Commitment is the ongoing practice of returning to a worthwhile direction.",
    action: "Review your saved actions and any practice plan. Keep or adjust one practice for the next 30 days. Write what you learned, the action you will repeat, its starting cue, and how you will restart after a miss.",
    choices: [
      "Keep a practice that worked and make its next month realistic.",
      "Shrink an overambitious practice so you can repeat it more reliably.",
      "Apply a lesson from your log to a different priority that now matters more.",
    ],
    prompt: "I learned ____. After ____, I will ____. If I miss, I will ____.",
    examples: [
      "I learned mornings work best. After breakfast, I will study ten minutes. If I miss, I will do one exercise at the next opportunity.",
      "I learned short calls are easier to keep. After Sunday lunch, I will call someone close to me. If we cannot connect, I will arrange another time.",
    ],
    doneWhen: "Your next practice, fragrance, frequency, and future review date are saved.",
    note: "Use One-Off Actions to record future repetitions. Your code, missions, and Proof Log stay with you. Thirty missions are a starting practice, not a guarantee that a habit is permanent.",
    youtubeId: null,
    implementation: "Show recent actions and any aim/practice. Require frequency and future review date. Future repetitions go into One-Off Actions.",
    rationale: "Previous title: Choose the Next Mission. Uses evidence and the earlier plan to choose what to keep or adjust for the next month.",
  },
];

export function getMissionDef(number: number): MissionDef | undefined {
  return MISSIONS.find((mission) => mission.number === number);
}

export function stageOf(def: MissionDef) {
  return STAGES[def.stage];
}
