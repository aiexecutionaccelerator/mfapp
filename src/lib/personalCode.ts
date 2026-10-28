import { CODE_LINES, liveRecordFor, recordText } from "@/lib/curriculum";
import type { Mission, Profile } from "@/lib/data/types";

/**
 * My Personal Code, compiled live from the records that write it, never
 * stored as its own copy, so it can't drift:
 *
 *   identity  — Mission 13, the same sentence as the profile's identity
 *   8–12      — the five code lines: honor, courage, commitment, boundary,
 *               promise
 *   practice  — the practice plan from Mission 30, else Mission 27
 *
 * Editing a line edits its record (same record, same date). Records that
 * already used a line (Missions 14 and 29) keep the version they used.
 */

export interface PersonalCodeLine {
  key: string;
  label: string;
  /** Where it comes from, named when the line is still empty. */
  source: string;
  /** The record behind it; null for an identity with no Mission 13 yet. */
  record: Mission | null;
  value: string | null;
}

export function compilePersonalCode(
  profile: Profile,
  missions: Mission[],
): PersonalCodeLine[] {
  const identityRecord = liveRecordFor(missions, 13);
  const practice = liveRecordFor(missions, 30) ?? liveRecordFor(missions, 27);

  return [
    {
      key: "identity",
      label: "I am becoming a man who…",
      source: "Mission 13",
      record: identityRecord,
      value:
        profile.identity_statement ??
        (identityRecord ? recordText(identityRecord) : null),
    },
    ...CODE_LINES.map((line) => {
      const record = liveRecordFor(missions, line.number);
      return {
        key: `m${line.number}`,
        label: line.label,
        source: `Mission ${line.number}`,
        record,
        value: record ? recordText(record) : null,
      };
    }),
    {
      key: "practice",
      label: "My practice",
      source: "Mission 27",
      record: practice,
      value: practice ? recordText(practice) : null,
    },
  ];
}

/** The current promise (Mission 12). */
export function currentPromise(missions: Mission[]): string | null {
  const record = liveRecordFor(missions, 12);
  return record ? recordText(record) : null;
}
