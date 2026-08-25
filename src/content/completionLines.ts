export const COMPLETION_LINES = [
  "Confidence is evidence. Keep building it.",
  "You said you would. You did.",
  "One proof doesn't change your life. Repetition can change how you see yourself.",
  "Record the win. Then move on.",
  "Build the evidence.",
] as const;

/** `totalCompleted` is the user's all-time completed Mission count. */
export function pickCompletionLine(totalCompleted: number): string {
  const length = COMPLETION_LINES.length;
  const index = ((totalCompleted % length) + length) % length;
  return COMPLETION_LINES[index];
}
