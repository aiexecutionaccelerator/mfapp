"use client";

import { Play } from "lucide-react";
import { useState } from "react";

/**
 * Click-to-load YouTube facade: a poster and a play button until the man asks
 * for the video, so opening a lesson costs one image instead of the whole
 * player. Privacy-enhanced host, no cookies until playback starts.
 */
export default function LessonVideo({
  youtubeId,
  title,
}: {
  youtubeId: string;
  title: string;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="glass relative mt-6 aspect-video w-full overflow-hidden rounded-[20px]">
      {playing ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1&playsinline=1&autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Play the video: ${title}`}
          className="group absolute inset-0 h-full w-full"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-70 transition-opacity duration-200 group-hover:opacity-85"
          />
          <span
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,9,13,.15),rgba(7,9,13,.65))]"
          />
          <span
            aria-hidden
            className="bg-gold-gradient absolute top-1/2 left-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full shadow-[0_8px_24px_rgba(0,0,0,.45)]"
          >
            <Play size={26} className="ml-1 text-[#07090D]" fill="#07090D" />
          </span>
        </button>
      )}
    </div>
  );
}
