"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

/** The old one-off address: Activate is the center tab now (23 Nov). */
function Redirect() {
  const router = useRouter();
  const params = useSearchParams();
  useEffect(() => {
    const trigger = params.get("trigger");
    router.replace(trigger ? `/activate?trigger=${encodeURIComponent(trigger)}` : "/activate");
  }, [params, router]);
  return null;
}

export default function DeclarePage() {
  return (
    <Suspense fallback={null}>
      <Redirect />
    </Suspense>
  );
}
