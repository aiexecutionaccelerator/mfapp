import clsx, { type ClassValue } from "clsx";
import { addDays, format, formatDistanceToNowStrict, parseISO } from "date-fns";

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

/** A calendar day ("2026-11-05"), read in local time, not UTC. */
export function formatDay(day: string): string {
  return format(parseISO(day), "MMM d, yyyy");
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

export function tomorrowLocal(now: Date = new Date()): string {
  return format(addDays(now, 1), "yyyy-MM-dd");
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
