"use client";

import { ChevronDown, Play } from "lucide-react";
import { useState } from "react";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/**
 * Optional Mission video — collapsed to one row by default, never autoplays,
 * never required. Expanding shows a click-to-load YouTube facade (a poster and
 * a play button), so nothing loads until the man asks for it.
 * Privacy-enhanced host, no cookies until playback starts.
 *
 * 19 Nov: the poster carries our own title, and it stays up (with a
 * spinner) until YouTube's frame has loaded, so tapping play never opens
 * on a black box. YouTube still draws its own controls and, when paused,
 * its title; an embed can't remove those.
 */
export default function MissionVideo({
  youtubeId,
  title,
  label = "Watch Antonio explain this",
  missionNumber,
  defaultOpen = false,
}: {
  youtubeId: string;
  title: string;
  label?: string;
  missionNumber?: number;
  /** Show the poster immediately (still click-to-play, never autoplay). */
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  return (
    <div className="mt-5">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-12 items-center gap-2 text-[15px] text-gold-300"
      >
        <Play aria-hidden size={16} />
        {label}
        <ChevronDown
          aria-hidden
          size={16}
          className={cn("transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="glass relative mt-3 aspect-video w-full overflow-hidden rounded-[20px]">
          {playing && (
            <iframe
              className={cn(
                "absolute inset-0 h-full w-full transition-opacity duration-300",
                ready ? "opacity-100" : "opacity-0",
              )}
              src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1&playsinline=1&autoplay=1&iv_load_policy=3&color=white`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              onLoad={() => setReady(true)}
            />
          )}
          {!(playing && ready) && (
            <button
              type="button"
              disabled={playing}
              onClick={() => {
                setPlaying(true);
                track("mission_video_played", {
                  missionNumber: missionNumber ?? null,
                  youtubeId,
                });
              }}
              aria-label={`Play the video: ${title}`}
              className="group absolute inset-0 h-full w-full text-left"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}
                alt=""
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
                className="absolute inset-0 h-full w-full scale-[1.02] object-cover opacity-60 transition-opacity duration-200 group-hover:opacity-75"
              />
              <span
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,9,13,.05)_30%,rgba(7,9,13,.85))]"
              />
              <span
                aria-hidden
                className={cn(
                  "bg-gold-gradient absolute top-[42%] left-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full shadow-[0_8px_24px_rgba(0,0,0,.45)] transition-transform duration-200 group-hover:scale-105",
                  playing && "animate-pulse",
                )}
              >
                <Play size={26} className="ml-1 text-[#07090D]" fill="#07090D" />
              </span>
              <span className="absolute right-4 bottom-3 left-4">
                <span className="eyebrow block text-gold-300">
                  {playing ? "Loading…" : "Antonio explains"}
                </span>
                <span className="font-display mt-0.5 block truncate text-[22px] leading-tight text-ink-0 uppercase">
                  {title}
                </span>
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
