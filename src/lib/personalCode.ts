import type { LessonResponse, Profile } from "@/lib/data/types";

/**
 * My Personal Code — compiled live from its sources, never stored as its own
 * record, so it can't drift. Each line points at where its answer lives:
 * the identity statement on the profile (refined by Mission 13), the rest in
 * Mission question answers.
 */

export interface PersonalCodeLine {
  key: string;
  /** The sentence opener, e.g. "Honor means…". */
  label: string;
  /** Where the answer comes from, shown when the line is empty. */
  source: string;
  /** Mission slug whose answer fills the line; null = identity statement. */
  slug: string | null;
  value: string | null;
}

export function compilePersonalCode(
  profile: Profile,
  responses: LessonResponse[],
): PersonalCodeLine[] {
  const answer = (slug: string): string | null =>
    responses.find((row) => row.lesson_id === slug && row.prompt_id === "q")
      ?.answer ?? null;

  return [
    {
      key: "identity",
      label: "I am becoming a man who…",
      source: "Mission 13",
      slug: "m13",
      value: answer("m13") ?? profile.identity_statement,
    },
    {
      key: "honor",
      label: "Honor means…",
      source: "Mission 8",
      slug: "m8",
      value: answer("m8"),
    },
    {
      key: "courage",
      label: "Courage means…",
      source: "Mission 9",
      slug: "m9",
      value: answer("m9"),
    },
    {
      key: "commitment",
      label: "Commitment means…",
      source: "Mission 10",
      slug: "m10",
      value: answer("m10"),
    },
    {
      key: "nonNegotiable",
      label: "My non-negotiable is…",
      source: "Mission 11",
      slug: "m11",
      value: answer("m11"),
    },
    {
      key: "promise",
      label: "The promise I am keeping is…",
      source: "Mission 12",
      slug: "m12",
      value: answer("m12"),
    },
    {
      key: "next",
      label: "My next 30-day commitment is…",
      source: "Mission 30",
      slug: "m30",
      value: answer("m30"),
    },
  ];
}

/** The current promise (Mission 12) — shown on the Progress screen. */
export function currentPromise(responses: LessonResponse[]): string | null {
  return (
    responses.find((row) => row.lesson_id === "m12" && row.prompt_id === "q")
      ?.answer ?? null
  );
}
