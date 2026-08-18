"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import NavAction from "@/components/NavAction";
import BottomActions from "@/components/ui/BottomActions";
import Button from "@/components/ui/Button";
import Headline from "@/components/ui/Headline";
import Spinner from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { CHALLENGE_LENGTH, rawChallengeDay } from "@/lib/challenge";
import { data } from "@/lib/data";
import type { Mission, Profile } from "@/lib/data/types";
import { computeStats } from "@/lib/stats";

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass rounded-[14px] p-4">
      <p className="font-display text-[40px] leading-none text-ink-0">{value}</p>
      <p className="eyebrow mt-2 text-ink-2">{label}</p>
    </div>
  );
}

export default function ChallengeCompletePage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [missions, setMissions] = useState<Mission[] | null>(null);
  const [pending, setPending] = useState(false);

  const load = useCallback(
    async function run(): Promise<void> {
      try {
        const [nextProfile, nextMissions] = await Promise.all([
          data.getProfile(),
          data.listMissions(),
        ]);
        if (
          !nextProfile.challenge_completed_at &&
          rawChallengeDay(nextProfile) < CHALLENGE_LENGTH
        ) {
          router.replace("/home");
          return;
        }
        setProfile(nextProfile);
        setMissions(nextMissions);
      } catch {
        showToast("Couldn't load your Mission.", { retry: () => void run() });
      }
    },
    [router, showToast],
  );

  useEffect(() => {
    void load();
  }, [load]);

  if (!profile || !missions) {
    return (
      <main className="flex flex-1 items-center justify-center text-ink-2">
        <Spinner />
      </main>
    );
  }

  const stats = computeStats(missions);

  async function continueMission() {
    setPending(true);
    try {
      await data.updateProfile({
        challenge_completed_at: new Date().toISOString(),
      });
      router.replace("/home");
    } catch {
      setPending(false);
      showToast("Couldn't save that. Please try again.", {
        retry: () => void continueMission(),
      });
    }
  }

  async function requestCertificate() {
    try {
      setProfile(await data.updateProfile({ certificate_requested: true }));
    } catch {
      showToast("Couldn't save that. Please try again.", {
        retry: () => void requestCertificate(),
      });
    }
  }

  return (
    <main className="flex flex-1 flex-col pt-2">
      <div className="flex justify-end">
        <NavAction kind="close" href="/home" />
      </div>

      <Headline className="mt-6">30-DAY MISSION COMPLETE</Headline>

      <p className="mt-4 text-[17px] text-ink-1">
        You&apos;ve spent 30 days turning scent into action. The challenge ends
        here. The Mission doesn&apos;t.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-3">
        <Stat label="Missions Started" value={stats.started} />
        <Stat label="Missions Completed" value={stats.completed} />
        <Stat label="Honor Reps" value={stats.reps.honor} />
        <Stat label="Courage Reps" value={stats.reps.courage} />
        <Stat label="Commitment Reps" value={stats.reps.commitment} />
      </div>

      <BottomActions className="pt-10">
        <Button loading={pending} onClick={continueMission}>
          CONTINUE THE MISSION
        </Button>
        {profile.certificate_requested ? (
          <Button variant="secondary" disabled>
            CERTIFICATE REQUESTED — we&apos;ll send it to {profile.email}
          </Button>
        ) : (
          <Button variant="secondary" onClick={requestCertificate}>
            GET MY CERTIFICATE
          </Button>
        )}
      </BottomActions>
    </main>
  );
}
