import clsx, { type ClassValue } from "clsx";
import { format, formatDistanceToNowStrict } from "date-fns";
import type { MissionDraft } from "@/lib/data/types";

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function formatDate(iso: string): string {
  return format(new Date(iso), "MMM d");
}

export function formatTime(iso: string): string {
  return format(new Date(iso), "h:mm a");
}

export function formatDateTime(iso: string): string {
  return format(new Date(iso), "MMM d, yyyy · h:mm a");
}

export function relativeTime(iso: string): string {
  return `${formatDistanceToNowStrict(new Date(iso))} ago`;
}

/** yyyy-MM-dd in the user's local calendar */
export function todayLocal(now: Date = new Date()): string {
  return format(now, "yyyy-MM-dd");
}

/* ---------- Mission draft (sessionStorage) ---------- */

const DRAFT_KEY = "mission.draft";

export function readDraft(): MissionDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as MissionDraft) : null;
  } catch {
    return null;
  }
}

export function writeDraft(draft: MissionDraft): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function clearDraft(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(DRAFT_KEY);
}

/* ---------- In-app reminder (localStorage) ---------- */

const REMINDER_KEY = "mission.reminder";

export interface Reminder {
  missionId: string;
  at: string;
}

export function readReminder(): Reminder | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(REMINDER_KEY);
    return raw ? (JSON.parse(raw) as Reminder) : null;
  } catch {
    return null;
  }
}

export function writeReminder(reminder: Reminder): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REMINDER_KEY, JSON.stringify(reminder));
}

export function clearReminderFor(missionId: string): void {
  if (typeof window === "undefined") return;
  const current = readReminder();
  if (current && current.missionId === missionId) {
    window.localStorage.removeItem(REMINDER_KEY);
  }
}
