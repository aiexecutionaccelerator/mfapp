"use client";

import { Camera, X } from "lucide-react";
import { useRef, useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { fileToProofPhoto } from "@/lib/photo";

/**
 * Optional proof photo. Downscales on-device to a size-capped data URL —
 * nothing uploads until the proof itself is logged. Never required.
 */
export default function PhotoInput({
  value,
  onChange,
  label = "ADD A PHOTO",
}: {
  value: string | null;
  onChange: (photo: string | null) => void;
  label?: string;
}) {
  const { showToast } = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [reading, setReading] = useState(false);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setReading(true);
    try {
      onChange(await fileToProofPhoto(file));
    } catch (cause) {
      showToast(
        cause instanceof Error ? cause.message : "Couldn't read that photo.",
      );
    } finally {
      setReading(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div>
      <input
        ref={input}
        type="file"
        accept="image/*"
        className="hidden"
        aria-hidden
        tabIndex={-1}
        onChange={(event) => void onFile(event.target.files?.[0])}
      />
      {value ? (
        <div className="relative overflow-hidden rounded-[14px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Your proof photo" className="w-full" />
          <button
            type="button"
            aria-label="Remove photo"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-ink-0"
          >
            <X size={18} aria-hidden />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={reading}
          onClick={() => input.current?.click()}
          className="glass flex min-h-12 w-full items-center justify-center gap-2 rounded-[14px] px-4 py-3 text-[15px] text-ink-1"
        >
          <Camera size={18} aria-hidden className="text-gold-300" />
          {reading ? "Reading…" : `${label} (optional)`}
        </button>
      )}
    </div>
  );
}
