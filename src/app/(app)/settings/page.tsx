"use client";

import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import Field from "@/components/ui/Field";
import Headline from "@/components/ui/Headline";
import Sheet from "@/components/ui/Sheet";
import Spinner from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import pkg from "../../../../package.json";
import { readDevDayOverride, setDevDayOverride } from "@/lib/challenge";
import { data } from "@/lib/data";
import type { Profile } from "@/lib/data/types";
import {
  DEV_TOOLS,
  LEGAL_PRIVACY_URL,
  LEGAL_TERMS_URL,
  SUPPORT_EMAIL,
} from "@/lib/env";
import { cn } from "@/lib/utils";

const DEV_OPTIONS = [
  { value: "new", label: "New user" },
  { value: "1", label: "Day 1" },
  { value: "5", label: "Day 5" },
  { value: "10", label: "Day 10" },
  { value: "15", label: "Day 15" },
  { value: "20", label: "Day 20" },
  { value: "25", label: "Day 25" },
  { value: "30", label: "Day 30" },
  { value: "post", label: "Post-challenge" },
];

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

export default function SettingsPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [devValue, setDevValue] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(
    async function run(): Promise<void> {
      try {
        const next = await data.getProfile();
        setProfile(next);
        setName(next.display_name ?? "");
        const override = readDevDayOverride();
        setDevValue(
          next.challenge_completed_at
            ? "post"
            : override !== null
              ? String(override)
              : "",
        );
      } catch {
        showToast("Couldn't load your settings.", { retry: () => void run() });
      }
    },
    [showToast],
  );

  useEffect(() => {
    void load();
  }, [load]);

  if (!profile) {
    return (
      <main className="flex min-h-dvh items-center justify-center text-ink-2">
        <Spinner />
      </main>
    );
  }

  async function saveName() {
    if (!profile) return;
    const trimmed = name.trim();
    if (trimmed === (profile.display_name ?? "")) return;
    try {
      setProfile(await data.updateProfile({ display_name: trimmed || null }));
    } catch {
      showToast("Couldn't save your name. Please try again.", {
        retry: () => void saveName(),
      });
    }
  }

  async function toggleNotifications() {
    if (!profile) return;
    try {
      setProfile(
        await data.updateProfile({
          notifications_enabled: !profile.notifications_enabled,
        }),
      );
    } catch {
      showToast("Couldn't save that. Please try again.", {
        retry: () => void toggleNotifications(),
      });
    }
  }

  async function applyDevState(value: string) {
    setDevValue(value);
    window.sessionStorage.removeItem("mission.completionShown");
    try {
      if (value === "new") {
        setDevDayOverride(null);
        await data.updateProfile({
          primary_goal: null,
          onboarding_completed: false,
          challenge_start_date: null,
          challenge_completed_at: null,
          certificate_requested: false,
        });
        router.replace("/onboarding");
        return;
      }
      if (value === "post") {
        setDevDayOverride(null);
        setProfile(
          await data.updateProfile({
            challenge_completed_at: new Date().toISOString(),
          }),
        );
        return;
      }
      setDevDayOverride(Number(value));
      setProfile(await data.updateProfile({ challenge_completed_at: null }));
    } catch {
      showToast("Couldn't change the challenge state.");
    }
  }

  async function signOut() {
    try {
      await data.signOut();
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
      await data.deleteAccount();
      await data.signOut();
      router.replace("/welcome?deleted=1");
    } catch {
      setDeleting(false);
      showToast("Couldn't delete your account. Please try again.", {
        retry: () => void deleteAccount(),
      });
    }
  }

  return (
    <main className="pt-[calc(env(safe-area-inset-top)+16px)]">
      <Headline>SETTINGS</Headline>

      <Group title="Profile">
        <Field
          label="Name"
          value={name}
          onChange={setName}
          onBlur={saveName}
          maxLength={60}
        />
        <div>
          <p className="eyebrow mb-2 text-ink-2">Email</p>
          <p className="text-[17px] text-ink-1">{profile.email ?? "—"}</p>
        </div>
      </Group>

      <Group title="Notifications">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[17px] text-ink-0">Reminders</p>
            <p className="mt-1 text-[13px] text-ink-2">
              In-app reminders for active Missions.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={profile.notifications_enabled}
            aria-label="Reminders"
            onClick={toggleNotifications}
            className={cn(
              "relative h-8 w-14 shrink-0 rounded-full border transition-colors",
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
          </button>
        </div>
      </Group>

      <Group title="Mission Fragrances">
        <button
          type="button"
          onClick={() => router.push("/shop")}
          className="flex min-h-12 w-full items-center justify-between gap-3 text-left"
        >
          <span className="text-[17px] text-ink-0">Get Mission Fragrances</span>
          <ChevronRight aria-hidden size={20} className="text-ink-2" />
        </button>
      </Group>

      <Group title="Legal & support">
        <a href={LEGAL_PRIVACY_URL} className="block min-h-12 text-[17px] text-ink-0">
          Privacy Policy
        </a>
        <a href={LEGAL_TERMS_URL} className="block min-h-12 text-[17px] text-ink-0">
          Terms
        </a>
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="block min-h-12 text-[17px] text-ink-0"
        >
          Support
        </a>
      </Group>

      {DEV_TOOLS && (
        <Group title="Developer">
          <label htmlFor="dev-state" className="eyebrow block text-ink-2">
            Challenge state
          </label>
          <select
            id="dev-state"
            value={devValue}
            onChange={(event) => void applyDevState(event.target.value)}
            className="min-h-12 w-full rounded-[14px] border border-[var(--line)] bg-[rgba(18,23,34,.6)] px-4 text-[17px] text-ink-0"
          >
            <option value="">Real date</option>
            {DEV_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
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
        Mission v{pkg.version}
      </p>

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
