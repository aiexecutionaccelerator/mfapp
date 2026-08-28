import type { Metadata } from "next";
import LegalPage, { Section } from "@/components/legal/LegalPage";
import { SUPPORT_EMAIL } from "@/lib/env";

export const metadata: Metadata = { title: "Privacy Policy" };

const UPDATED = "August 18, 2026";

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated={UPDATED}>
      <p>
        This Privacy Policy explains how Mission Fragrances (&ldquo;Mission
        Fragrances,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;) collects, uses,
        and protects information when you use the Mission Fragrances app (the
        &ldquo;App&rdquo;). It applies to the App only. Purchases made on
        missionfragrances.com and through Shopify checkout are covered by the
        store&rsquo;s privacy policy at missionfragrances.com/policies/privacy-policy.
      </p>

      <Section title="What we collect">
        <p>We collect only what the App needs to work:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong className="text-ink-0">Account:</strong> your email address
            (used to sign you in with a one-time code) and the name you
            give us.
          </li>
          <li>
            <strong className="text-ink-0">Identity statement:</strong> the
            sentence you write during setup about the man you are becoming.
          </li>
          <li>
            <strong className="text-ink-0">Missions:</strong> the trigger you
            select (Honor, Courage, or Commitment), the action you declare, its
            status, timestamps, the answers you write to Mission questions, the
            proof you record, and any optional photo you choose to attach.
          </li>
          <li>
            <strong className="text-ink-0">Preferences:</strong> your reminder
            setting and 30-Day Mission progress.
          </li>
          <li>
            <strong className="text-ink-0">Notifications:</strong> if you turn
            on device notifications, your browser&rsquo;s push subscription
            endpoint (a device token) — deleted when you turn notifications off
            or delete your account.
          </li>
          <li>
            <strong className="text-ink-0">Technical:</strong> standard server
            logs (IP address, browser type, timestamps) needed to run and secure
            the service.
          </li>
        </ul>
        <p>
          We do not collect your location, contacts, photos, microphone, health
          data, or advertising identifiers. We do not use third-party tracking or
          advertising SDKs in the App.
        </p>
      </Section>

      <Section title="How we use it">
        <ul className="list-disc space-y-1 pl-5">
          <li>To sign you in and keep your Mission Log tied to your account.</li>
          <li>To show your Proofs, progress, and history back to you.</li>
          <li>To send the sign-in code you request by email.</li>
          <li>To operate, secure, debug, and improve the App.</li>
        </ul>
        <p>
          Your declared actions, written answers, proofs, and photos are
          personal. We do not display them publicly, sell them, use them for
          advertising, or send their contents to analytics tools.
        </p>
      </Section>

      <Section title="Where it is stored and who sees it">
        <p>
          App data is stored with Supabase, our database and authentication
          provider, on servers in the United States, and is protected by
          per-user access rules so that only you can read your Missions. Sign-in
          emails are delivered by our email provider. These providers process
          data on our behalf and under our instructions.
        </p>
        <p>
          If you buy Mission Fragrances from the App, checkout
          happens on Shopify. Shopify collects your payment, shipping, and
          contact details directly; the App never sees or stores your card
          information and does not keep an order record.
        </p>
        <p>
          We may disclose information if required by law, or to protect the
          rights, safety, or property of Mission Fragrances or others.
        </p>
      </Section>

      <Section title="Your choices and rights">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong className="text-ink-0">Delete your account</strong> at any
            time from Settings → Delete Account. This permanently removes your
            profile and every Mission you logged.
          </li>
          <li>
            <strong className="text-ink-0">Access, correct, or export</strong>{" "}
            your data, or ask questions, by emailing {SUPPORT_EMAIL}.
          </li>
          <li>
            Depending on where you live (for example the EU/UK or California) you
            may have additional rights, including to object to or restrict
            processing and to lodge a complaint with your local data protection
            authority. We will not discriminate against you for exercising them.
          </li>
        </ul>
      </Section>

      <Section title="Retention and security">
        <p>
          We keep your data while your account exists. When you delete your
          account it is removed from our live systems promptly; residual copies
          in encrypted backups expire on their normal schedule. We use
          industry-standard safeguards, but no method of transmission or storage
          is completely secure.
        </p>
      </Section>

      <Section title="Children">
        <p>
          The App is intended for adults. We do not knowingly collect personal
          information from anyone under 16. If you believe a child has provided
          us information, contact us and we will delete it.
        </p>
      </Section>

      <Section title="Changes">
        <p>
          We may update this policy from time to time. We will change the
          &ldquo;Last updated&rdquo; date above and, for material changes,
          notify you in the App.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Mission Fragrances
          <br />
          PO Box 415, Wittenberg, WI 54499, United States
          <br />
          {SUPPORT_EMAIL}
        </p>
      </Section>
    </LegalPage>
  );
}
