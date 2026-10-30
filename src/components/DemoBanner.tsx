export default function DemoBanner() {
  return (
    // A landmark, so screen readers file it with the page's regions.
    <aside
      aria-label="Demo mode"
      className="print-hide sticky top-0 z-40 -mx-5 shrink-0 bg-[var(--bg-0)]/85 px-5 pt-[calc(env(safe-area-inset-top)+8px)] pb-2 text-center backdrop-blur-sm"
    >
      <p className="eyebrow text-gold-300 tracking-[0.05em]">
        DEMO MODE — data stored on this device
      </p>
    </aside>
  );
}
