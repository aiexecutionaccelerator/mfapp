import type { ReactNode } from "react";

export default function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="glass rounded-[20px] px-5 py-10 text-center">
      <p className="font-display text-[30px] text-ink-0 uppercase">{title}</p>
      {body && <p className="mt-2 text-[15px] text-ink-1">{body}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
