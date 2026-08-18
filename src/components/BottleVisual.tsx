import { bottleArt } from "@/lib/art";
import type { Trigger } from "@/lib/data/types";
import { cn } from "@/lib/utils";

const FINISH: Record<Trigger, string> = {
  honor:
    "linear-gradient(150deg,#F2F4F7 0%,#C9CDD3 38%,#8D939C 62%,#E4E7EB 100%)",
  courage:
    "linear-gradient(150deg,#E8D28A 0%,#D4AF37 40%,#8F6E1E 68%,#E8D28A 100%)",
  commitment:
    "linear-gradient(150deg,#2A2E38 0%,#15181F 45%,#3A3F4B 75%,#1B1F27 100%)",
};

/** Bottle art from /images/{trigger}.png; falls back to a drawn silhouette. */
export default function BottleVisual({
  trigger,
  size = 56,
  className,
}: {
  trigger: Trigger;
  size?: number;
  className?: string;
}) {
  const width = size;
  const height = Math.round(size * 1.45);
  const src = bottleArt(trigger);

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width, height }}
      aria-hidden
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          width={width}
          height={height}
          className="absolute inset-0 h-full w-full object-contain"
          style={{ filter: "drop-shadow(0 10px 18px rgba(0,0,0,.45))" }}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center">
          <div
            className="rounded-[2px]"
            style={{
              width: Math.max(6, size * 0.22),
              height: Math.max(6, size * 0.14),
              background: "linear-gradient(180deg,#E8D28A,#8F6E1E)",
            }}
          />
          <div
            className="mt-[2px] w-full flex-1 rounded-[6px] border border-[var(--line-strong)]"
            style={{
              background: FINISH[trigger],
              boxShadow: "inset 0 1px 0 rgba(255,255,255,.35)",
            }}
          />
        </div>
      )}
    </div>
  );
}
