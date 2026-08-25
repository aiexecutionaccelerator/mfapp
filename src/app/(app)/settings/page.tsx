"use client";

import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ReminderExplainer, {
  REMINDER_EXPLAINER_TITLE,
} from "@/components/ReminderExplainer";
import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import Field from "@/components/ui/Field";
import Headline from "@/components/ui/Headline";
import Sheet from "@/components/ui/Sheet";
import Spinner from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import pkg from "../../../../package.json";
import { getMissionDef } from "@/content/missions";
import { track } from "@/lib/analytics";
import { store, useAppData } from "@/lib/data/store";
import {
  DEV_TOOLS,
  LEGAL_PRIVACY_URL,
  LEGAL_TERMS_URL,
  SUPPORT_EMAIL,
} from "@/lib/env";
import {
  getPermission,
  hasActiveSubscription,
  subscribeToPush,
  unsubscribeFromPush,
  usePushSupport,
} from "@/lib/push";
import { cn } from "@/lib/utils";

/** "0.5.0-beta" → "Beta 0.5"; "1.2.0" → "v1.2.0". */
function formatVersion(v: string): string {
  const m = v.match(/^(\d+)\.(\d+)\.\d+-beta/);
  return m ? `Beta ${m[1]}.${m[2]}` : `v${v}`;
}

function Group({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6">
      <Eyebrow>{title}</Eyebrow>
      <div className="glass mt-3 space-y-4 rounded-[20px] p-5">{children}</div>
    </section>
  );
}

function LinkRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-12 w-full items-center justify-between gap-3 text-left"
    >
      <span className="text-[17px] text-ink-0">{label}</span>
      <ChevronRight aria-hidden size={20} className="text-ink-2" />
    </button>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const { profile, missions, error, refresh } = useAppData();
  const [name, setName] = useState("");
  const [identity, setIdentity] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pushOn, setPushOn] = useState(false);
  const [explainerOpen, setExplainerOpen] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const support = usePushSupport();
  // Seed the editable fields once; a background revalidate must not clobber typing.
  const seeded = useRef(false);

  useEffect(() => {
    if (!error) return;
    showToast("Couldn't load your settings.", { retry: () => void refresh() });
  }, [error, refresh, showToast]);

  useEffect(() => {
    void hasActiveSubscription().then(setPushOn);
  }, []);

  useEffect(() => {
    if (!profile || seeded.current) return;
    seeded.current = true;
    setName(profile.display_name ?? "");
    setIdentity(profile.identity_statement ?? "");
  }, [profile]);

  if (!profile) {
    return (
      <main className="flex flex-1 items-center justify-center text-ink-2">
        <Spinner />
      </main>
    );
  }

  async function saveName() {
    if (!profile) return;
    const trimmed = name.trim();
    if (trimmed === (profile.display_name ?? "")) return;
    try {
      await store.updateProfile({ display_name: trimmed || null });
    } catch {
      showToast("Couldn't save your name. Please try again.", {
        retry: () => void saveName(),
      });
    }
  }

  async function saveIdentity() {
    if (!profile) return;
    const trimmed = identity.trim();
    if (trimmed === (profile.identity_statement ?? "")) return;
    try {
      await store.updateProfile({ identity_statement: trimmed || null });
    } catch {
      showToast("Couldn't save that. Please try again.", {
        retry: () => void saveIdentity(),
      });
    }
  }

  async function saveNotifications(enabled: boolean) {
    try {
      await store.updateProfile({ notifications_enabled: enabled });
    } catch {
      showToast("Couldn't save that. Please try again.", {
        retry: () => void saveNotifications(enabled),
      });
    }
  }

  async function toggleNotifications() {
    if (!profile) return;

    if (profile.notifications_enabled) {
      await unsubscribeFromPush().catch(() => {});
      setPushOn(false);
      await saveNotifications(false);
      return;
    }

    // Turning on: ask for the device only once we have explained why.
    if (support === "supported") {
      if (getPermission() !== "granted") {
        setExplainerOpen(true);
        return;
      }
      setPushOn((await subscribeToPush()) === "granted");
    }
    await saveNotifications(true);
  }

  async function allowNotifications() {
    setSubscribing(true);
    const result = await subscribeToPush();
    setSubscribing(false);
    setExplainerOpen(false);
    setPushOn(result === "granted");
    if (result === "denied") {
      showToast(
        "Notifications are off for this site. We'll flag the Mission in-app instead.",
      );
    }
    await saveNotifications(true);
  }

  async function keepInAppOnly() {
    setExplainerOpen(false);
    await saveNotifications(true);
  }

  async function toggleSetStatus() {
    if (!profile) return;
    const next = profile.set_status === "arrived" ? "ordered" : "arrived";
    try {
      await store.updateProfile({ set_status: next });
      if (next === "arrived") track("set_marked_arrived");
      track("set_status_selected", { setStatus: next });
    } catch {
      showToast("Couldn't save that. Please try again.");
    }
  }

  async function resetToNewUser() {
    try {
      await store.deleteAccount();
      router.replace("/welcome");
    } catch {
      showToast("Couldn't reset the app state.");
    }
  }

  /** Dev QA helper: land one declared+completed Proof on Missions 1–29. */
  async function seed29() {
    if (seeding) return;
    setSeeding(true);
    try {
      for (let n = 1; n <= 29; n += 1) {
        const def = getMissionDef(n);
        if (!def) continue;
        const exists = missions?.some(
          (m) => m.mission_number === n && m.status === "completed",
        );
        if (exists) continue;
        const row = await store.createMission({
          trigger: def.recommendedTrigger ?? "honor",
          action_text: `Seeded action for Mission ${n}`,
          action_category: "dev-seed",
          mission_number: n,
        });
        await store.completeMission(row.id, {
          reflection: `Seeded proof for Mission ${n}`,
        });
      }
      showToast("Missions 1–29 completed.");
    } catch {
      showToast("Seeding stopped early — check the log.");
    } finally {
      setSeeding(false);
    }
  }

  async function signOut() {
    try {
      await store.signOut();
      router.replace("/welcome");
    } catch {
      showToast("Couldn't sign out. Please try again.", {
        retry: () => void signOut(),
      });
    }
  }

  async function deleteAccount() {
    setDeleting(true);
    try {
      await store.deleteAccount();
      await store.signOut();
      router.replace("/welcome?deleted=1");
    } catch {
      setDeleting(false);
      showToast("Couldn't delete your account. Please try again.", {
        retry: () => void deleteAccount(),
      });
    }
  }

  const reminderHelper =
    support === "ios-needs-install"
      ? "Add to Home Screen to enable notifications on iPhone"
      : profile.notifications_enabled && pushOn
        ? "Device notifications on"
        : "In-app reminders only";

  return (
    <main className="pt-4">
      <Headline>SETTINGS</Headline>

      <Group title="Profile">
        <Field
          label="Name"
          value={name}
          onChange={setName}
          onBlur={saveName}
          maxLength={60}
        />
        <Field
          label="The man I am becoming"
          value={identity}
          onChange={setIdentity}
          onBlur={saveIdentity}
          maxLength={280}
          multiline
          rows={2}
        />
        <div>
          <p className="eyebrow mb-2 text-ink-2">Email</p>
          <p className="text-[17px] text-ink-1">{profile.email ?? "—"}</p>
        </div>
      </Group>

      <Group title="Notifications">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[17px] text-ink-0">Daily Mission Reminder</p>
            <p className="mt-1 text-[13px] text-ink-2">
              A simple reminder to choose one value and take one action.
            </p>
            <p className="mt-1 text-[13px] text-ink-2">{reminderHelper}</p>
          </div>
          {/* 48px hit area around a 32px track. */}
          <button
            type="button"
            role="switch"
            aria-checked={profile.notifications_enabled}
            aria-label="Daily Mission Reminder"
            onClick={toggleNotifications}
            className="flex h-12 w-14 shrink-0 items-center justify-center"
          >
            <span
              className={cn(
                "relative block h-8 w-14 rounded-full border transition-colors",
                profile.notifications_enabled
                  ? "border-[var(--gold-500)] bg-[rgba(201,166,72,.25)]"
                  : "border-[var(--line)] bg-[rgba(18,23,34,.6)]",
              )}
            >
              <span
                className={cn(
                  "absolute top-1 h-6 w-6 rounded-full transition-all",
                  profile.notifications_enabled
                    ? "left-7 bg-gold-gradient"
                    : "left-1 bg-[var(--ink-2)]",
                )}
              />
            </span>
          </button>
        </div>
      </Group>

      <Group title="Mission Fragrances">
        <LinkRow
          label="How It Works"
          onClick={() => router.push("/how-it-works")}
        />
        <LinkRow
          label="Using Your Set"
          onClick={() => router.push("/using-your-set")}
        />
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[17px] text-ink-0">My Set Status</p>
            <p className="mt-1 text-[13px] text-ink-2">
              {profile.set_status === "arrived"
                ? "My set is here"
                : "On the way"}
            </p>
          </div>
          <Button
            variant="secondary"
            full={false}
            className="min-h-12 px-4 text-[13px]"
            onClick={() => void toggleSetStatus()}
          >
            {profile.set_status === "arrived" ? "MARK ORDERED" : "IT ARRIVED"}
          </Button>
        </div>
        {!profile.owns_set && (
          <LinkRow
            label="Get Mission Fragrances"
            onClick={() => router.push("/shop")}
          />
        )}
      </Group>

      <Group title="Legal & support">
        <a
          href={LEGAL_PRIVACY_URL}
          className="flex min-h-12 items-center text-[17px] text-ink-0"
        >
          Privacy Policy
        </a>
        <a
          href={LEGAL_TERMS_URL}
          className="flex min-h-12 items-center text-[17px] text-ink-0"
        >
          Terms
        </a>
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="flex min-h-12 items-center text-[17px] text-ink-0"
        >
          Support
        </a>
      </Group>

      {DEV_TOOLS && (
        <Group title="Developer">
          <Button variant="secondary" onClick={() => void resetToNewUser()}>
            Reset to new user
          </Button>
          <Button
            variant="secondary"
            loading={seeding}
            onClick={() => void seed29()}
          >
            Seed Missions 1–29 complete
          </Button>
        </Group>
      )}

      <Group title="Account">
        <Button variant="secondary" onClick={signOut}>
          Sign out
        </Button>
        <Button variant="danger" onClick={() => setConfirmDelete(true)}>
          Delete Account
        </Button>
      </Group>

      <p className="mt-8 text-center text-[13px] text-ink-2">
        Mission Fragrances · {formatVersion(pkg.version)}
      </p>

      <Sheet
        open={explainerOpen}
        title={REMINDER_EXPLAINER_TITLE}
        onClose={() => void keepInAppOnly()}
      >
        <ReminderExplainer
          loading={subscribing}
          onAllow={() => void allowNotifications()}
          onNotNow={() => void keepInAppOnly()}
        />
      </Sheet>

      <Sheet
        open={confirmDelete}
        title="DELETE YOUR ACCOUNT?"
        note="This permanently deletes your profile and every Mission you've logged. This can't be undone."
        onClose={() => setConfirmDelete(false)}
      >
        <Button variant="danger" loading={deleting} onClick={deleteAccount}>
          DELETE MY ACCOUNT
        </Button>
        <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
          Cancel
        </Button>
      </Sheet>
    </main>
  );
}
