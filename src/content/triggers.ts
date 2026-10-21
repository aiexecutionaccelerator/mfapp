export const TRIGGERS = {
  honor: {
    name: "HONOR",
    /** Behavior descriptors — the Start cards. */
    tagline: "Integrity · Responsibility · Respect",
    /** Behavior words on the Meet Your Scent Triggers onboarding screen. */
    onboardingWords: "Integrity · Responsibility · Respect",
    onboardingLine:
      "Act in alignment with your values, take responsibility, and show people they matter.",
    declareHeadline: "HOW WILL YOU BE A MAN OF HONOR TODAY?",
    about:
      "Honor is the gift a man gives himself — the standard he lives by. It isn't bestowed by anyone else; it's cultivated from within and measured by the quiet satisfaction of acting in line with your principles. Be true to your word. Stand up for what you believe in. Take responsibility for your actions.",
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
      "Act despite fear, discomfort, hesitation, or uncertainty.",
    declareHeadline: "HOW WILL YOU PRACTICE COURAGE TODAY?",
    about:
      "Courage isn't a switch you flip in a crisis. It's built through the daily practice of mastering your fear — mental, moral, and physical strength earned by doing the hard thing anyway. Not every brave act is audacious: sticking to the plan, saying no, climbing the ladder. Every small act builds a courageous man.",
    applyLine: "Apply Courage now.",
    anchorWord: "COURAGEOUS",
    provedWith: "Courage",
  },
  commitment: {
    name: "COMMITMENT",
    tagline: "Discipline · Consistency · Follow-Through",
    onboardingWords: "Discipline · Consistency · Follow-Through",
    onboardingLine:
      "Follow through after the excitement and motivation begin to fade.",
    declareHeadline: "WHAT WILL YOU COMMIT TO TODAY?",
    about:
      "Commitment is more than a promise. It's a conscious decision to stick to a goal or task in the face of adversity — the spirit of determination and dedication that leads to the mastery of self. It doesn't come and go with your moods. It starts small: daily decisions that line up with what you said you wanted.",
    applyLine: "Apply Commitment now.",
    anchorWord: "COMMITTED",
    provedWith: "Commitment",
  },
} as const;

export const TRIGGER_ORDER = ["honor", "courage", "commitment"] as const;

/** S.T.A.R. — the simplified V2 definition. Never a required lesson. */
export const STAR_STEPS = [
  { letter: "S", name: "Select", text: "Choose the value you need right now." },
  {
    letter: "T",
    name: "Trigger",
    text: "Spray the fragrance and recall one time you lived that value.",
  },
  { letter: "A", name: "Act", text: "Take one small real-world action." },
  {
    letter: "R",
    name: "Record",
    text: "Write down what you did — that one line completes the Mission.",
  },
] as const;

/**
 * Accents match the bottles: Honor = silver, Courage = gold, Commitment = black.
 *
 * `color`/`glow` are the bottle's own finish — right for a fill, such as the
 * dot beside an eyebrow, where black reads as black against a light ring
 * (`edge`). `ui`/`uiGlow` are for borders, rims and glows, where black has
 * nothing to show: Commitment takes a warm ivory rim there, because a black
 * bottle is read by the light on its edge rather than by its colour.
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
