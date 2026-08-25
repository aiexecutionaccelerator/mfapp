export default function ProgressRing({
  value,
  max,
  label = "MISSIONS COMPLETE",
  size = 180,
}: {
  value: number;
  max: number;
  label?: string;
  size?: number;
}) {
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(value / max, 1));

  return (
    <div
      className="relative"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${value} of ${max} ${label.toLowerCase()}`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ring-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8F6E1E" />
            <stop offset="45%" stopColor="#D4AF37" />
            <stop offset="70%" stopColor="#E8D28A" />
            <stop offset="100%" stopColor="#B8912F" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--line)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#ring-gold)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-display leading-none text-ink-0"
          style={{ fontSize: (size * 52) / 180 }}
        >
          {value}/{max}
        </span>
        <span
          className="eyebrow mt-2 text-center text-ink-1"
          style={{ fontSize: (size * 11) / 180 }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
