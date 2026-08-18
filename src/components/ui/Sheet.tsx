"use client";

import type { ReactNode } from "react";

export default function Sheet({
  open,
  title,
  note,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  note?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="glass rise-in relative w-full max-w-[430px] rounded-t-[20px] p-5 pb-[calc(env(safe-area-inset-bottom)+20px)]"
      >
        <p className="text-[17px] font-semibold text-ink-0">{title}</p>
        {note && <p className="mt-2 text-[13px] text-ink-2">{note}</p>}
        <div className="mt-5 space-y-3">{children}</div>
      </div>
    </div>
  );
}
