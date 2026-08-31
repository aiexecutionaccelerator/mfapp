/**
 * send-reminders — the only thing that ever pushes to a device.
 *
 * Called once a minute by pg_cron (see supabase/migrations/0003_push.sql).
 * Sends the single reminder notification for Missions that are still active,
 * then marks the reminder as sent. Never sends marketing, streaks or anything
 * a user did not explicitly schedule.
 *
 * Secrets: CRON_SECRET, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT.
 * Deploy with --no-verify-jwt; the CRON_SECRET bearer token is the gate.
 */

import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2.47.10";

const BATCH_SIZE = 200;
const TITLE = "Mission Fragrances";
const BODY = "Your action is waiting. Did you do it?";
const DEFAULT_SUBJECT = "mailto:antonio@missionfragrances.com";

interface ReminderRow {
  id: string;
  user_id: string;
  mission_id: string;
}

interface MissionRow {
  id: string;
  status: string;
}

interface SubscriptionRow {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function statusOf(error: unknown): number | null {
  if (typeof error === "object" && error !== null && "statusCode" in error) {
    const code = (error as { statusCode?: unknown }).statusCode;
    if (typeof code === "number") return code;
  }
  return null;
}

Deno.serve(async (request: Request): Promise<Response> => {
  const cronSecret = Deno.env.get("CRON_SECRET");
  if (!cronSecret) return json({ error: "CRON_SECRET is not set" }, 500);
  if (request.headers.get("Authorization") !== `Bearer ${cronSecret}`) {
    return json({ error: "unauthorized" }, 401);
  }

  const publicKey = Deno.env.get("VAPID_PUBLIC_KEY");
  const privateKey = Deno.env.get("VAPID_PRIVATE_KEY");
  if (!publicKey || !privateKey) {
    return json({ error: "VAPID keys are not set" }, 500);
  }
  webpush.setVapidDetails(
    Deno.env.get("VAPID_SUBJECT") ?? DEFAULT_SUBJECT,
    publicKey,
    privateKey,
  );

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return json({ error: "Supabase environment is not set" }, 500);
  }
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // 1. Reminders that are due and have never been sent.
  const { data: dueRows, error: dueError } = await admin
    .from("reminders")
    .select("id,user_id,mission_id")
    .is("sent_at", null)
    .lte("send_at", new Date().toISOString())
    .order("send_at", { ascending: true })
    .limit(BATCH_SIZE);
  if (dueError) return json({ error: dueError.message }, 500);

  const due = (dueRows ?? []) as ReminderRow[];
  if (due.length === 0) return json({ due: 0, sent: 0 });

  // 2. Drop reminders whose Mission is no longer active — nothing to nag about.
  const missionIds = [...new Set(due.map((row) => row.mission_id))];
  const { data: missionRows, error: missionError } = await admin
    .from("missions")
    .select("id,status")
    .in("id", missionIds);
  if (missionError) return json({ error: missionError.message }, 500);

  const missions = (missionRows ?? []) as MissionRow[];
  const active = new Set(
    missions.filter((row) => row.status === "active").map((row) => row.id),
  );

  const stale = due.filter((row) => !active.has(row.mission_id));
  if (stale.length > 0) {
    await admin
      .from("reminders")
      .delete()
      .in(
        "id",
        stale.map((row) => row.id),
      );
  }

  const sendable = due.filter((row) => active.has(row.mission_id));
  if (sendable.length === 0) {
    return json({ due: due.length, sent: 0, dropped: stale.length });
  }

  // 3. Every device belonging to those users.
  const userIds = [...new Set(sendable.map((row) => row.user_id))];
  const { data: subRows, error: subError } = await admin
    .from("push_subscriptions")
    .select("id,user_id,endpoint,p256dh,auth")
    .in("user_id", userIds);
  if (subError) return json({ error: subError.message }, 500);

  const byUser = new Map<string, SubscriptionRow[]>();
  for (const row of (subRows ?? []) as SubscriptionRow[]) {
    const list = byUser.get(row.user_id) ?? [];
    list.push(row);
    byUser.set(row.user_id, list);
  }

  // 4. Send.
  const goneSubscriptionIds: string[] = [];
  const handledReminderIds: string[] = [];
  let sent = 0;

  for (const reminder of sendable) {
    const subscriptions = byUser.get(reminder.user_id) ?? [];
    const payload = JSON.stringify({
      title: TITLE,
      body: BODY,
      url: `/action/checkin/${reminder.mission_id}`,
    });

    for (const subscription of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.p256dh, auth: subscription.auth },
          },
          payload,
        );
        sent += 1;
      } catch (error) {
        const status = statusOf(error);
        // The endpoint is dead — the browser dropped or replaced it.
        if (status === 404 || status === 410) {
          goneSubscriptionIds.push(subscription.id);
        } else {
          console.error("push failed", subscription.id, error);
        }
      }
    }

    // Marked either way: a reminder fires once, even with no live device.
    handledReminderIds.push(reminder.id);
  }

  if (handledReminderIds.length > 0) {
    const { error } = await admin
      .from("reminders")
      .update({ sent_at: new Date().toISOString() })
      .in("id", handledReminderIds);
    if (error) console.error("marking reminders sent failed", error);
  }

  if (goneSubscriptionIds.length > 0) {
    await admin.from("push_subscriptions").delete().in("id", goneSubscriptionIds);
  }

  return json({
    due: due.length,
    sent,
    dropped: stale.length,
    removedSubscriptions: goneSubscriptionIds.length,
  });
});
