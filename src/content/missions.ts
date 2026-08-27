import type { Trigger } from "@/lib/data/types";

/**
 * Your 30-Day Mission — the thirty Missions, verbatim from the V2 spec.
 *
 * All thirty are visible and unlocked from day one; the recommended order is
 * 1–30 but any Mission can be opened any time. Reading completes nothing — a
 * Mission is complete only when a real-world action is logged as a Proof.
 *
 * One reusable Mission Detail template renders these; never add a per-Mission
 * component. Edit copy here, not in screens.
 */

export interface MissionActions {
  quick: string;
  standard: string;
  bold: string;
}

export interface MissionDef {
  number: number;
  /** Stable answer key: lesson_id in lesson_responses is this slug. */
  slug: string;
  title: string;
  /** The short idea — readable in 30–45 seconds. */
  idea: string;
  /** null = the user chooses the value. */
  recommendedTrigger: Trigger | null;
  /** Omitted when the Mission needs no written answer (Mission 1). */
  question?: string;
  /** Optional tap-to-consider examples under the question. */
  exampleAnswers?: string[];
  /** Trigger-independent suggestions… */
  actions?: MissionActions;
  /** …or per-trigger suggestions (Mission 1). */
  actionsByTrigger?: Record<Trigger, MissionActions>;
  proofPrompt: string;
  proofPlaceholder?: string;
  photoEncouraged?: boolean;
  /** Mission 13: seed the answer with the onboarding identity statement. */
  prefillIdentity?: boolean;
  /** Missions 14 and 29: show the compiled Personal Code. */
  showPersonalCode?: boolean;
  /** Optional, collapsed, never required. Mapped from the old library. */
  youtubeId: string | null;
}

/** Optional intro videos reused from the old library. Never block progress. */
export const INTRO_VIDEOS = {
  moreThanFragrance: "p1VGPvExpx0",
  star: "_xs_ANlHjJ8",
  usingYourSet: "FCZ7-xwRPWI",
} as const;

/** Antonio explaining each value — shown under the Meet Your Scent Triggers
    cards (the same videos Missions 8–10 carry). */
export const TRIGGER_VIDEOS: Record<Trigger, string> = {
  honor: "a9yG3pylUKY",
  courage: "NCeKnEezPWs",
  commitment: "ihWgFp5H0DU",
};

export const MISSIONS: MissionDef[] = [
  {
    number: 1,
    slug: "m1",
    title: "Your First Step",
    idea: "You do not become a better man by thinking about it. You become him by acting. Choose the value you need today, use the scent, take one small action, and record your first piece of evidence.",
    recommendedTrigger: null,
    actionsByTrigger: {
      honor: {
        quick: "Thank someone who deserves it.",
        standard: "Keep a promise you made.",
        bold: "Admit a mistake without making an excuse.",
      },
      courage: {
        quick: "Send, “Can we talk today?”",
        standard: "Send the message you have been avoiding.",
        bold: "Make the difficult call now.",
      },
      commitment: {
        quick: "Complete five focused minutes.",
        standard: "Complete the workout or task you planned.",
        bold: "Finish the overdue action you keep postponing.",
      },
    },
    proofPrompt: "What did you do?",
    youtubeId: null,
  },
  {
    number: 2,
    slug: "m2",
    title: "Send the Message",
    idea: "Every time you avoid a difficult conversation, you teach yourself that discomfort makes your decisions. Courage begins when you take the first honest step—not when fear disappears.",
    recommendedTrigger: "courage",
    question: "What conversation, email, or message have you been avoiding?",
    actions: {
      quick: "Send, “Can we talk today?”",
      standard: "Send the email or message you have been postponing.",
      bold: "Call the person now.",
    },
    proofPrompt: "What did you send or say?",
    youtubeId: null,
  },
  {
    number: 3,
    slug: "m3",
    title: "Keep One Promise",
    idea: "Self-trust grows when your actions match your word. The promise does not need to be impressive. It needs to be kept.",
    recommendedTrigger: "commitment",
    question: "What is one small promise you can keep today?",
    actions: {
      quick: "Complete five minutes of the task.",
      standard: "Do the workout, meal, call, or work block you planned.",
      bold: "Finish one overdue commitment completely.",
    },
    proofPrompt: "Which promise did you keep?",
    youtubeId: null,
  },
  {
    number: 4,
    slug: "m4",
    title: "Honor Someone Who Matters",
    idea: "Honor is not only about standards and responsibility. It is also about recognizing the people who matter and treating them accordingly.",
    recommendedTrigger: "honor",
    question: "Who deserves to hear that you value or appreciate them?",
    actions: {
      quick: "Send a sincere text.",
      standard: "Call and tell them specifically what you appreciate.",
      bold: "Pair your words with a meaningful act of service or ownership.",
    },
    proofPrompt: "Who did you honor, and how?",
    youtubeId: null,
  },
  {
    number: 5,
    slug: "m5",
    title: "Act Before You Feel Ready",
    idea: "Waiting until you feel completely ready is often another form of avoidance. Courage means taking the next reasonable step while uncertainty is still present.",
    recommendedTrigger: "courage",
    question: "What have you delayed because you do not feel ready?",
    actions: {
      quick: "Open the document, form, or conversation.",
      standard: "Submit, publish, schedule, or ask.",
      bold: "Take the step that creates a real possibility of rejection.",
    },
    proofPrompt: "What step did you take?",
    youtubeId: null,
  },
  {
    number: 6,
    slug: "m6",
    title: "Remember the Man You Have Already Been",
    idea: "You are not trying to invent Honor, Courage, or Commitment from nothing. You have already lived these values. Remembering one real example gives you evidence that this man is already part of you.",
    recommendedTrigger: null,
    question: "Describe one time you showed Honor, Courage, or Commitment.",
    exampleAnswers: [
      "A difficult period you survived.",
      "A promise you kept.",
      "A time you stood up for someone.",
      "Something you finished despite wanting to quit.",
      "A decision you made when the easier choice was available.",
    ],
    actions: {
      quick: "Repeat a small version of that same action today.",
      standard: "Take one action today that shows the same value.",
      bold: "Take a bigger version of that action than you did back then.",
    },
    proofPrompt:
      "What past example did you remember, and how did you repeat that value today?",
    youtubeId: null,
  },
  {
    number: 7,
    slug: "m7",
    title: "Build Your Shrine to Self-Improvement",
    idea: "Create a visible place for the man you are becoming. This is not religious. It is simply a physical reminder that makes your values and commitments difficult to ignore.",
    recommendedTrigger: "commitment",
    question:
      "What objects remind you of your values, your history, and the man you want to become?",
    actions: {
      quick: "Choose the location.",
      standard: "Place the three fragrances and one meaningful object there.",
      bold: "Complete the full display with a photograph, book, written goal, quote, or personal item.",
    },
    proofPrompt: "Describe what you set up.",
    photoEncouraged: true,
    youtubeId: "GCpsEfFp_E8",
  },
  {
    number: 8,
    slug: "m8",
    title: "Honor, in Your Words",
    idea: "Honor becomes useful when it is personal. Define it in language that can guide your decisions when doing the right thing is inconvenient.",
    recommendedTrigger: "honor",
    question: "Complete this sentence: “Honor means…”",
    exampleAnswers: [
      "Doing what I said I would do.",
      "Taking responsibility without excuses.",
      "Treating people well even when they can do nothing for me.",
    ],
    actions: {
      quick: "Keep one small promise.",
      standard: "Take responsibility for something.",
      bold: "Correct something you know is wrong.",
    },
    proofPrompt: "What did Honor mean today, and how did you act on it?",
    youtubeId: "a9yG3pylUKY",
  },
  {
    number: 9,
    slug: "m9",
    title: "Courage, in Your Words",
    idea: "Courage is not the absence of fear. It is deciding that fear does not get the final vote.",
    recommendedTrigger: "courage",
    question: "Complete this sentence: “Courage means…”",
    exampleAnswers: [
      "Speaking honestly even when the conversation is uncomfortable.",
      "Acting before I feel completely ready.",
      "Accepting the possibility of rejection.",
    ],
    actions: {
      quick: "State an honest opinion.",
      standard: "Begin an uncomfortable conversation.",
      bold: "Take an action that risks rejection or failure.",
    },
    proofPrompt: "How did you act with Courage?",
    youtubeId: "NCeKnEezPWs",
  },
  {
    number: 10,
    slug: "m10",
    title: "Commitment, in Your Words",
    idea: "Commitment begins after excitement fades. Define what follow-through means in your life, then prove the definition with action.",
    recommendedTrigger: "commitment",
    question: "Complete this sentence: “Commitment means…”",
    exampleAnswers: [
      "Following through after motivation disappears.",
      "Keeping promises to myself.",
      "Doing what matters even when I do not feel like doing it.",
    ],
    actions: {
      quick: "Complete five minutes.",
      standard: "Finish today’s planned action.",
      bold: "Return to something important you abandoned.",
    },
    proofPrompt: "How did you demonstrate Commitment?",
    youtubeId: "ihWgFp5H0DU",
  },
  {
    number: 11,
    slug: "m11",
    title: "Your Non-Negotiable",
    idea: "Standards become powerful when you know which ones are not open for negotiation. Choose one principle you refuse to compromise.",
    recommendedTrigger: "honor",
    question: "What is one standard you will not compromise?",
    exampleAnswers: [
      "I tell the truth.",
      "I take responsibility for my decisions.",
      "I do not speak disrespectfully about my family.",
      "I finish important work before distracting myself.",
      "I take care of my body.",
    ],
    actions: {
      quick: "Write the standard where you can see it.",
      standard: "Make one decision according to it.",
      bold: "Say no to something that violates it.",
    },
    proofPrompt: "How did you protect your standard today?",
    youtubeId: null,
  },
  {
    number: 12,
    slug: "m12",
    title: "The Promise That Matters Most",
    idea: "A dozen vague goals create noise. One clear promise creates direction. Choose the commitment that would matter most if you kept it.",
    recommendedTrigger: "commitment",
    question:
      "What is the one promise you most need to keep over the next 30 days?",
    actions: {
      quick: "Write the promise clearly.",
      standard: "Schedule the first action.",
      bold: "Complete the first action immediately.",
    },
    proofPrompt: "What promise did you make, and what first step did you take?",
    youtubeId: null,
  },
  {
    number: 13,
    slug: "m13",
    title: "The Man You Are Becoming",
    idea: "Identity gives your actions direction. Instead of asking only what you want, define who you are becoming.",
    recommendedTrigger: null,
    question: "Complete this sentence: “I am becoming a man who…”",
    prefillIdentity: true,
    actions: {
      quick: "Read the statement aloud.",
      standard: "Place it somewhere visible.",
      bold: "Take one action immediately that proves the statement.",
    },
    proofPrompt: "What did you do that matched the man you are becoming?",
    youtubeId: null,
  },
  {
    number: 14,
    slug: "m14",
    title: "Build My Personal Code",
    idea: "You have defined the man you are becoming, the meaning of your three values, your non-negotiable, and your most important promise. Bring them together into one clear Personal Code.",
    recommendedTrigger: null,
    question: "Which line of your Personal Code matters most today?",
    showPersonalCode: true,
    actions: {
      quick: "Read the full code aloud.",
      standard: "Edit it until every sentence feels true.",
      bold: "Choose one line and act on it immediately.",
    },
    proofPrompt: "Which part of your Personal Code did you put into action?",
    youtubeId: null,
  },
  {
    number: 15,
    slug: "m15",
    title: "Strengthen a Relationship",
    idea: "We become busy providing, working, and solving problems, then neglect the people those efforts are meant to serve. Strengthen one relationship with one deliberate action.",
    recommendedTrigger: "honor",
    question: "Which relationship needs your attention today?",
    actions: {
      quick: "Send a sincere message.",
      standard: "Call or schedule time together.",
      bold: "Apologize, address an issue, or make a meaningful commitment.",
    },
    proofPrompt: "Who did you show up for, and what did you do?",
    youtubeId: "NGi4l1rNc50",
  },
  {
    number: 16,
    slug: "m16",
    title: "Respect Your Body",
    idea: "Taking care of your body is not vanity. It is stewardship. Make one decision today that the healthier version of you would respect.",
    recommendedTrigger: "commitment",
    question: "What is one action a man who respects his body would take today?",
    actions: {
      quick: "Drink water, stretch, or walk for ten minutes.",
      standard: "Complete the workout or prepare the healthy meal.",
      bold: "Make the appointment or remove the habit you keep excusing.",
    },
    proofPrompt: "What did you do for your health?",
    youtubeId: "co2ZBwcMsjM",
  },
  {
    number: 17,
    slug: "m17",
    title: "Do the Important Work",
    idea: "Easy work creates the feeling of progress. Important work creates results. Identify the task you have been replacing with smaller, safer work.",
    recommendedTrigger: "commitment",
    question: "What important action have you been avoiding with easier work?",
    actions: {
      quick: "Work on it for ten focused minutes.",
      standard: "Complete the next meaningful step.",
      bold: "Finish or deliver it today.",
    },
    proofPrompt: "What important work did you complete?",
    youtubeId: "8UbE1PcGqC0",
  },
  {
    number: 18,
    slug: "m18",
    title: "Face the Numbers",
    idea: "Financial problems grow in the dark. Looking clearly at the numbers is an act of responsibility and Courage.",
    recommendedTrigger: "courage",
    question: "What financial action have you avoided?",
    actions: {
      quick: "Check the account or review one statement.",
      standard: "Transfer money, cancel a subscription, or send an invoice.",
      bold: "Have the financial conversation or make the corrective decision.",
    },
    proofPrompt: "What financial action did you take?",
    youtubeId: "GqQmxeLr6GI",
  },
  {
    number: 19,
    slug: "m19",
    title: "Improve Your Environment",
    idea: "Your surroundings either support the man you want to be or make his life harder. Improve one physical or digital space today.",
    recommendedTrigger: "commitment",
    question: "What part of your environment creates unnecessary friction?",
    actions: {
      quick: "Clear one surface or delete ten distracting files.",
      standard: "Organize one room, drawer, inbox, or workspace.",
      bold: "Remove or repair the item that repeatedly creates disorder.",
    },
    proofPrompt: "What did you improve?",
    photoEncouraged: true,
    youtubeId: null,
  },
  {
    number: 20,
    slug: "m20",
    title: "Be Useful to Someone",
    idea: "Legacy is built through usefulness, service, and the way people experience you. Help one person without needing recognition.",
    recommendedTrigger: "honor",
    question:
      "Who could benefit from your time, experience, encouragement, or help?",
    actions: {
      quick: "Send encouragement or useful information.",
      standard: "Offer direct help.",
      bold: "Mentor, volunteer, or solve a meaningful problem for someone.",
    },
    proofPrompt: "Who did you help, and how?",
    youtubeId: "oU7fHhMoXoY",
  },
  {
    number: 21,
    slug: "m21",
    title: "Choose the Area That Changes Everything",
    idea: "Not every area deserves equal attention right now. Choose the one area where consistent action would create the greatest positive effect.",
    recommendedTrigger: null,
    question:
      "Which area would most improve your life right now: relationships, health, work, money, environment, or service?",
    actions: {
      quick: "Name the area and one next step.",
      standard: "Schedule recurring time for it.",
      bold: "Complete the first meaningful action immediately.",
    },
    proofPrompt: "Which area did you choose, and what did you do?",
    youtubeId: null,
  },
  {
    number: 22,
    slug: "m22",
    title: "One Thing Beats Nothing",
    idea: "The smallest version of the right action is still infinitely more valuable than doing nothing. Lower the barrier and begin.",
    recommendedTrigger: "commitment",
    question:
      "What is the smallest version of an important action you can complete today?",
    actions: {
      quick: "Do two minutes.",
      standard: "Complete one clear portion.",
      bold: "Continue after starting and finish the entire task.",
    },
    proofPrompt: "What one thing did you complete?",
    youtubeId: "FaJhvhVPb9c",
  },
  {
    number: 23,
    slug: "m23",
    title: "Get 1% Better",
    idea: "Major change is often the result of small improvements repeated long enough to compound. Improve one part of your life by a small but real amount.",
    recommendedTrigger: "commitment",
    question: "Where can you get 1% better today?",
    actions: {
      quick: "Make one tiny improvement.",
      standard: "Add the improvement to an existing routine.",
      bold: "Remove one recurring behavior that works against it.",
    },
    proofPrompt: "What did you improve?",
    youtubeId: "MePOS7sTKH0",
  },
  {
    number: 24,
    slug: "m24",
    title: "Protect What Matters",
    idea: "Every yes spends time, attention, or energy. Protecting what matters often requires the Courage to say no to something merely good.",
    recommendedTrigger: "courage",
    question:
      "What is taking time or energy away from something more important?",
    actions: {
      quick: "Decline one minor request.",
      standard: "Cancel, postpone, or delegate one commitment.",
      bold: "Establish a clear boundary and communicate it.",
    },
    proofPrompt: "What did you remove or protect?",
    youtubeId: "VkA4H2mZNII",
  },
  {
    number: 25,
    slug: "m25",
    title: "Find the 20% That Matters",
    idea: "A small number of actions create most meaningful results. Identify the work, habit, relationship, or decision that deserves disproportionate attention.",
    recommendedTrigger: "commitment",
    question:
      "What small set of actions creates the greatest result in your life right now?",
    actions: {
      quick: "Identify the most valuable action.",
      standard: "Spend thirty focused minutes on it.",
      bold: "Remove a lower-value activity and redirect that time permanently.",
    },
    proofPrompt: "What high-value action did you take?",
    youtubeId: "CiNTVRxOgyY",
  },
  {
    number: 26,
    slug: "m26",
    title: "Make the Identity-Based Choice",
    idea: "Goals ask what you want. Identity asks what a man like you does next. Make one decision based on who you are becoming.",
    recommendedTrigger: null,
    question:
      "What would an honorable, courageous, or committed man do in the decision you are facing?",
    actions: {
      quick: "State the identity-based choice.",
      standard: "Make the decision.",
      bold: "Act on the decision immediately.",
    },
    proofPrompt: "What identity-based choice did you make?",
    youtubeId: "ZMBy99RiuvM",
  },
  {
    number: 27,
    slug: "m27",
    title: "Make One Real Commitment",
    idea: "A useful commitment is clear enough to measure and specific enough to act on. Choose one result, one behavior, and one timeframe.",
    recommendedTrigger: "commitment",
    question: "What specific commitment will you keep over the next 30 days?",
    exampleAnswers: [
      "I will walk for twenty minutes four times a week for the next thirty days.",
    ],
    actions: {
      quick: "Write the commitment.",
      standard: "Schedule the actions.",
      bold: "Complete the first action now.",
    },
    proofPrompt: "What did you commit to, and what first action did you take?",
    youtubeId: "QZQjcgh26jA",
  },
  {
    number: 28,
    slug: "m28",
    title: "Review the Evidence",
    idea: "Your Mission Log now contains evidence—not wishes or intentions. Review what you have done and notice which actions most changed the way you see yourself.",
    recommendedTrigger: null,
    question:
      "Which completed action gives you the strongest evidence of the man you are becoming?",
    actions: {
      quick: "Select the proof that matters most.",
      standard: "Repeat that action today.",
      bold: "Raise the standard and complete a stronger version.",
    },
    proofPrompt: "Which proof did you choose, and how did you build on it?",
    youtubeId: null,
  },
  {
    number: 29,
    slug: "m29",
    title: "Finalize and Share Your Personal Code",
    idea: "Your Personal Code should reflect what you now know about yourself, not simply what sounded good at the beginning. Refine it using the evidence you collected.",
    recommendedTrigger: "honor",
    question:
      "What needs to be added, removed, or strengthened in your Personal Code?",
    showPersonalCode: true,
    actions: {
      quick: "Read the final version aloud.",
      standard: "Share it with one trusted person.",
      bold: "Ask that person for honest feedback and accountability.",
    },
    proofPrompt: "How did you finalize or share your Personal Code?",
    youtubeId: null,
  },
  {
    number: 30,
    slug: "m30",
    title: "Choose the Next Mission",
    idea: "The thirty-Mission challenge ends here. The practice does not. Choose what you will build next and attach it to one of your three Scent Triggers.",
    recommendedTrigger: "commitment",
    question:
      "What is your next 30-day commitment, and which Scent Trigger will support it?",
    actions: {
      quick: "Write the next commitment.",
      standard: "Schedule the first week.",
      bold: "Take the first action immediately.",
    },
    proofPrompt: "What is your next Mission, and what first step did you complete?",
    youtubeId: null,
  },
];

export function getMissionDef(number: number): MissionDef | undefined {
  return MISSIONS.find((mission) => mission.number === number);
}

export function actionsFor(
  mission: MissionDef,
  trigger: Trigger,
): MissionActions {
  return mission.actionsByTrigger?.[trigger] ?? mission.actions as MissionActions;
}
