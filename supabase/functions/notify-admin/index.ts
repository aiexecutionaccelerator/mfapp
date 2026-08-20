// Admin notifications: emails antonio@missionfragrances.com when a user
// completes onboarding ("signup") or finishes all 30 lessons ("course_complete").
// Called by database triggers (see migrations/0006_admin_notifications.sql)
// with `Authorization: Bearer NOTIFY_SECRET`. Sends via the Brevo API.

const ADMIN_EMAIL = "antonio@missionfragrances.com";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function template(headline: string, rows: [string, string][]): string {
  const rowsHtml = rows
    .map(
      ([k, v]) =>
        `<p style="margin:0 0 10px 0;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:1.5;color:#C9C4B8;"><span style="color:#8B8779;text-transform:uppercase;font-size:12px;letter-spacing:2px;">${k}</span><br><strong style="color:#F5F1E8;">${esc(v)}</strong></p>`,
    )
    .join("");
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#07090D;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#07090D" style="background:#07090D;">
  <tr><td align="center" style="padding:40px 16px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
      <tr><td align="center" style="padding:0 0 28px 0;">
        <img src="https://app.missionfragrances.com/images/mflogo.png" alt="Mission Fragrances" width="220" style="display:block;width:220px;height:auto;border:0;">
      </td></tr>
      <tr><td bgcolor="#121722" style="background:#121722;border:1px solid #2A3040;border-radius:20px;padding:36px 28px;">
        <p style="margin:0 0 6px 0;font-family:Helvetica,Arial,sans-serif;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#C9A648;">App notification</p>
        <h1 style="margin:0 0 18px 0;font-family:'Arial Narrow',Impact,Helvetica,Arial,sans-serif;font-size:30px;line-height:1.1;letter-spacing:1px;text-transform:uppercase;color:#F5F1E8;">${headline}</h1>
        ${rowsHtml}
      </td></tr>
      <tr><td align="center" style="padding:28px 12px 0 12px;">
        <p style="margin:0 0 6px 0;font-family:Helvetica,Arial,sans-serif;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#8B8779;">Honor &nbsp;·&nbsp; Courage &nbsp;·&nbsp; Commitment</p>
        <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:#5E5B52;">Mission Fragrances App</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

Deno.serve(async (req) => {
  const secret = Deno.env.get("NOTIFY_SECRET");
  if (!secret || req.headers.get("Authorization") !== `Bearer ${secret}`) {
    return new Response("unauthorized", { status: 401 });
  }

  let payload: { type?: string; name?: string; email?: string };
  try {
    payload = await req.json();
  } catch {
    return new Response("bad request", { status: 400 });
  }

  const name = (payload.name || "").trim() || "(no name)";
  const email = (payload.email || "").trim() || "(no email)";
  const when = new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC";

  let subject: string;
  let html: string;
  if (payload.type === "signup") {
    subject = `${name} just signed up — Mission Fragrances App`;
    html = template("New sign-up", [
      ["Name", name],
      ["Email", email],
      ["When", when],
    ]);
  } else if (payload.type === "course_complete") {
    subject = `${name} finished the 30-Day Course — Mission Fragrances App`;
    html = template("Course complete", [
      ["Name", name],
      ["Email", email],
      ["Finished", when],
      ["Lessons", "30 of 30"],
    ]);
  } else {
    return new Response("unknown type", { status: 400 });
  }

  const apiKey = Deno.env.get("BREVO_API_KEY");
  if (!apiKey) {
    console.error("notify-admin: BREVO_API_KEY not set");
    return new Response("sender not configured", { status: 500 });
  }

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      sender: {
        name: "Mission Fragrances App",
        email: Deno.env.get("NOTIFY_FROM") ?? ADMIN_EMAIL,
      },
      to: [{ email: ADMIN_EMAIL }],
      subject,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    console.error("notify-admin: Brevo send failed", res.status, await res.text());
    return new Response("send failed", { status: 502 });
  }
  return new Response("ok", { status: 200 });
});
