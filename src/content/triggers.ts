export const TRIGGERS = {
  honor: {
    name: "HONOR",
    /** Behavior descriptors — the Start cards. */
    tagline: "Integrity · Responsibility · Respect",
    /** Behavior words on the Meet Your Scent Triggers onboarding screen. */
    onboardingWords: "Integrity · Responsibility · Respect",
    /** The definition from the missionfragrances.com sales page. */
    onboardingLine:
      "You live by a moral code, tell the truth, keep promises, and own your actions.",
    declareHeadline: "HOW WILL YOU BE A MAN OF HONOR TODAY?",
    about:
      "Honor is the standard you live by. Nobody hands it to you. Keep your word. Stand up for what's right. Own what you do.",
    applyLine: "Apply Honor now.",
    /** For the anchor line: "recall a moment you were HONORABLE". */
    anchorWord: "HONORABLE",
    /** "Proof logged. You acted with Honor." */
    provedWith: "Honor",
  },
  courage: {
    name: "COURAGE",
    tagline: "Act Despite Fear · Speak Honestly · Move Forward",
    onboardingWords: "Speak Honestly · Move First · Act Despite Fear",
    onboardingLine:
      "You do what you know is right despite fear, danger, or pressure to do otherwise.",
    declareHeadline: "HOW WILL YOU PRACTICE COURAGE TODAY?",
    about:
      "Courage is built, not born. Every time you do the hard thing anyway, you get stronger. Small acts count.",
    applyLine: "Apply Courage now.",
    anchorWord: "COURAGEOUS",
    provedWith: "Courage",
  },
  commitment: {
    name: "COMMITMENT",
    tagline: "Discipline · Consistency · Follow-Through",
    onboardingWords: "Discipline · Consistency · Follow-Through",
    onboardingLine:
      "You fulfill your responsibilities through consistent effort and perseverance.",
    declareHeadline: "WHAT WILL YOU COMMIT TO TODAY?",
    about:
      "Commitment is keeping a promise after the excitement's gone. It doesn't care about your mood. It starts small, one choice a day.",
    applyLine: "Apply Commitment now.",
    anchorWord: "COMMITTED",
    provedWith: "Commitment",
  },
} as const;

export const TRIGGER_ORDER = ["honor", "courage", "commitment"] as const;

/**
 * The S.T.A.R. System — ONE definition, used everywhere it appears: the
 * onboarding slide, the reminder sheet on every Mission, Settings → How It
 * Works and Using Your Set. Antonio's wording (Oct 26): Trigger is the spray
 * itself; the recall lives in Act, because remembering a time you lived the
 * value works almost as well as doing something new.
 */
export const STAR_STEPS = [
  { letter: "S", name: "Select", text: "Select the core value you need." },
  {
    letter: "T",
    name: "Trigger",
    text: "Spray the fragrance and breathe it in. This is how you build the trigger.",
  },
  {
    letter: "A",
    name: "Act",
    text: "Take one small action that's aligned with the value, or recall a time you lived it.",
    example: "Example: spray Honor, then do or remember something honorable.",
  },
  {
    letter: "R",
    name: "Record",
    text: "Log what you did in the app. It's one piece of proof that you're becoming the man you know yourself to be.",
  },
] as const;

/** Under the four steps, wherever they appear. */
export const STAR_CLOSER =
  "Do this a dozen times and you start to associate the scent with the emotion and the memory. Do it 30 times and it becomes hardwired.";

/**
 * Accents match the bottles: Honor = silver, Courage = gold, Commitment = black.
 *
 * `color`/`glow` are the bottle's own finish — right for a fill, such as the
 * dot beside an eyebrow, where black reads as black against a light ring
 * (`edge`). `ui`/`uiGlow` are for borders, rims and glows, where black has
 * nothing to show: Commitment takes a warm ivory rim there, because a black
 * bottle is read by the light on its edge rather than by its color.
 */
export const TRIGGER_ACCENTS = {
  honor: {
    color: "var(--honor)",
    glow: "var(--honor-glow)",
    edge: null,
    ui: "var(--honor)",
    uiGlow: "var(--honor-glow)",
  },
  courage: {
    color: "var(--courage)",
    glow: "var(--courage-glow)",
    edge: null,
    ui: "var(--courage)",
    uiGlow: "var(--courage-glow)",
  },
  commitment: {
    color: "var(--commitment)",
    glow: "var(--commitment-glow)",
    edge: "rgba(245,241,232,.32)",
    ui: "var(--commitment-ui)",
    uiGlow: "var(--commitment-ui-glow)",
  },
} as const;
