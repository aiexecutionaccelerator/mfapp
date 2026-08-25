import { data } from "@/lib/data";

/**
 * Fire-and-forget product analytics (spec §12). Events go to the
 * analytics_events table in Supabase; demo mode records nothing. A failed
 * event never surfaces — the backend swallows errors.
 */
export function track(name: string, props?: Record<string, unknown>): void {
  void data.trackEvent(name, props);
}
