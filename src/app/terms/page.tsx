import type { Metadata } from "next";
import LegalPage, { Section } from "@/components/legal/LegalPage";
import { SUPPORT_EMAIL } from "@/lib/env";

export const metadata: Metadata = { title: "Terms of Service" };

const UPDATED = "August 18, 2026";

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated={UPDATED}>
      <p>
        These Terms of Service (&ldquo;Terms&rdquo;) govern your use of the
        Mission Fragrances app (the &ldquo;App&rdquo;) provided by Mission
        Fragrances (&ldquo;Mission Fragrances,&rdquo; &ldquo;we,&rdquo;
        &ldquo;us&rdquo;). By creating an account or using the App you agree to
        these Terms. If you do not agree, do not use the App.
      </p>

      <Section title="What the App is">
        <p>
          The App is a companion to Mission Fragrances — the Honor, Courage,
          and Commitment Scent Triggers&reg;. It helps you select a value — Honor, Courage, or Commitment
          — declare a real-world action, apply the matching fragrance as a cue,
          take the action, and record the result in your Mission Log. It works
          with any fragrance you already own; owning the Mission Fragrances set is
          not required.
        </p>
        <p>
          The App is a self-directed behavior tool. It is not medical, mental
          health, or professional advice, and it makes no guarantee of any
          particular result. You are responsible for the actions you choose to
          take.
        </p>
      </Section>

      <Section title="Your account">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            You must be at least the age of majority where you live to create an
            account.
          </li>
          <li>
            You sign in with a one-time code sent to your email. Keep access to
            that email secure; you are responsible for activity under your
            account.
          </li>
          <li>
            You may delete your account at any time from Settings. Deletion is
            permanent.
          </li>
          <li>
            We may suspend or close accounts that abuse the service, attempt to
            access other users&rsquo; data, or violate these Terms.
          </li>
        </ul>
      </Section>

      <Section title="Your content">
        <p>
          The actions and reflections you record belong to you. You grant us
          only the limited license needed to store and display them back to you
          and to operate the App. Do not record content that is unlawful or
          that infringes anyone else&rsquo;s rights.
        </p>
      </Section>

      <Section title="Purchases">
        <p>
          The App lets you buy the Mission Fragrances set through Shopify
          checkout. Those purchases are made from the Mission Fragrances online
          store and are governed by the store&rsquo;s Terms of Service, Shipping
          Policy, and Refund Policy at missionfragrances.com/policies, including
          the 30-day money-back guarantee: if you are not happy with the set,
          contact us within 30 days of delivery for a full refund (do not mail
          fragrances back unless instructed, as they are classified as flammable).
          Shopify handles payment, taxes, and shipping; the App does not process
          or store payment details. The App itself is free to use and contains no
          in-app digital purchases or subscriptions.
        </p>
      </Section>

      <Section title="Intellectual property">
        <p>
          The App, its design, content, and trademarks — including Mission
          Fragrances, the MF crest, Scent Triggers&reg;, and Performance
          Enhancing Colognes&reg; — are owned by Mission Fragrances or its
          licensors. You may use the App for personal, non-commercial purposes
          only. Do not copy, modify, reverse engineer, or resell it.
        </p>
      </Section>

      <Section title="Availability and changes">
        <p>
          We may change, suspend, or discontinue any part of the App at any
          time, and may update these Terms. Continued use after an update means
          you accept the revised Terms. We will note the &ldquo;Last
          updated&rdquo; date above.
        </p>
      </Section>

      <Section title="Disclaimers and limitation of liability">
        <p>
          The App is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;
          without warranties of any kind, express or implied. To the fullest
          extent permitted by law, Mission Fragrances and its officers,
          employees, and partners are not liable for any indirect, incidental,
          special, consequential, or punitive damages, or for any loss of data,
          arising from your use of or inability to use the App. Where liability
          cannot be excluded, it is limited to the amount you paid us for the App
          (which is zero) or the minimum permitted by law.
        </p>
      </Section>

      <Section title="Governing law">
        <p>
          These Terms are governed by the laws of the United States and the
          State of Wisconsin, without regard to conflict-of-law rules. Any
          dispute will be brought in the state or federal courts located in
          Wisconsin, and you consent to their jurisdiction.
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
