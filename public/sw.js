/*
 * Mission Fragrances service worker.
 *
 * Reminders only: one notification type, sent by the send-reminders Edge
 * Function. Deliberately no fetch handler and no caching — this worker exists
 * so the browser can wake the app for a push, nothing else.
 */

const DEFAULT_TITLE = "Mission Fragrances";
const DEFAULT_BODY = "Your action is waiting. Did you do it?";
const DEFAULT_URL = "/home";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = {};
  }

  const title = payload.title || DEFAULT_TITLE;
  const body = payload.body || DEFAULT_BODY;
  const url = payload.url || DEFAULT_URL;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url },
      tag: "mission-reminder",
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  const url = data.url || DEFAULT_URL;

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(async (clients) => {
        for (const client of clients) {
          // Focus is best-effort (some platforms refuse it); the navigate is
          // what actually gets the user to the check-in screen.
          if ("focus" in client) {
            try {
              await client.focus();
            } catch {
              /* keep going — navigating still helps */
            }
          }
          if ("navigate" in client) return client.navigate(url);
          return undefined;
        }
        return self.clients.openWindow(url);
      }),
  );
});
