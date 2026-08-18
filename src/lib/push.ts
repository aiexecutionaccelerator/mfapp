import { useSyncExternalStore } from "react";
import { hasPush, VAPID_PUBLIC_KEY } from "@/lib/env";
import { createClient } from "@/lib/supabase/client";

/**
 * Web Push for the one reminder we send. Nothing here runs in demo mode, and
 * nothing subscribes without an explicit tap — see the explainer sheet on the
 * Mission Active screen.
 */

export type PushSupport = "supported" | "ios-needs-install" | "unsupported";
export type SubscribeResult = "granted" | "denied" | "error";

const SW_URL = "/sw.js";

function isIos(): boolean {
  const ua = navigator.userAgent;
  // iPadOS 13+ reports as Macintosh; a touch-capable "Mac" is an iPad.
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
  );
}

function isStandalone(): boolean {
  const legacy = (navigator as Navigator & { standalone?: boolean }).standalone;
  return (
    window.matchMedia("(display-mode: standalone)").matches || legacy === true
  );
}

/**
 * Raw capability of this browser. iOS only exposes PushManager to web apps
 * installed on the Home Screen, so that case is reported separately — the
 * check has to come first, because plain iOS Safari fails the capability test.
 */
export function getPushSupport(): PushSupport {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return "unsupported";
  }
  if (isIos() && !isStandalone()) return "ios-needs-install";
  const capable =
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window;
  return capable ? "supported" : "unsupported";
}

/** What the screens ask: capability *and* a backend configured to deliver. */
export function getReminderSupport(): PushSupport {
  if (!hasPush()) return "unsupported";
  return getPushSupport();
}

const noSubscribe = () => () => {};
const unsupported = (): PushSupport => "unsupported";

/**
 * Support for a screen. It reads the browser, so the server snapshot is always
 * "unsupported" — that keeps the first client render identical to the HTML.
 */
export function usePushSupport(): PushSupport {
  return useSyncExternalStore(noSubscribe, getReminderSupport, unsupported);
}

export function getPermission(): NotificationPermission | null {
  if (typeof window === "undefined" || !("Notification" in window)) return null;
  return Notification.permission;
}

/** Registered on every real-mode load so a push can wake the app. */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }
  try {
    return await navigator.serviceWorker.register(SW_URL);
  } catch {
    return null;
  }
}

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const normalized = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(normalized);
  const bytes = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

/**
 * Asks for permission, subscribes, and stores the endpoint. Only ever called
 * from a tap on ALLOW NOTIFICATIONS.
 */
export async function subscribeToPush(): Promise<SubscribeResult> {
  if (getReminderSupport() !== "supported") return "error";

  try {
    const registration = (await registerServiceWorker()) ?? null;
    if (!registration) return "error";
    await navigator.serviceWorker.ready;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return "denied";

    const subscription =
      (await registration.pushManager.getSubscription()) ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      }));

    const keys = subscription.toJSON().keys;
    if (!keys?.p256dh || !keys.auth) return "error";

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return "error";

    const { error } = await supabase.from("push_subscriptions").upsert(
      {
        user_id: user.id,
        endpoint: subscription.endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        user_agent: navigator.userAgent,
      },
      { onConflict: "endpoint" },
    );
    if (error) return "error";

    return "granted";
  } catch {
    return "error";
  }
}

/** Turns the device off: browser unsubscribe plus the stored endpoint. */
export async function unsubscribeFromPush(): Promise<void> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }
  const registration = await navigator.serviceWorker.getRegistration(SW_URL);
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) return;

  const { endpoint } = subscription;
  try {
    await subscription.unsubscribe();
  } catch {
    /* the row still has to go */
  }
  if (!hasPush()) return;
  await createClient().from("push_subscriptions").delete().eq("endpoint", endpoint);
}

/** True when this device already has a stored subscription in the browser. */
export async function hasActiveSubscription(): Promise<boolean> {
  if (getReminderSupport() !== "supported") return false;
  if (getPermission() !== "granted") return false;
  const registration = await navigator.serviceWorker.getRegistration(SW_URL);
  return Boolean(await registration?.pushManager.getSubscription());
}
