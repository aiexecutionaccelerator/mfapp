import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The small slice of markdown the course copy actually uses:
 * `##`/`###` headings, `**bold**`, `- ` bullets, `1. ` numbered lists,
 * `![alt](src)` images and `[text](url)` links. Anything else is a paragraph.
 *
 * Deliberately not a library — the input is our own content file, never user
 * input, and it only changes when someone edits `content/course.ts`.
 */

const INLINE = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;
const IMAGE = /^!\[([^\]]*)\]\(([^)]+)\)$/;
const BULLET = /^-\s+(.*)$/;
const NUMBERED = /^\d+\.\s+(.*)$/;

const LIST_CLASS = "mt-4 space-y-2 pl-6 text-[17px] leading-relaxed text-ink-1";

function inline(text: string, key: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let index = 0;

  for (const match of text.matchAll(INLINE)) {
    const at = match.index;
    if (at > last) nodes.push(text.slice(last, at));
    index += 1;
    if (match[1] !== undefined) {
      nodes.push(
        <strong key={`${key}-b${index}`} className="font-semibold text-ink-0">
          {match[1]}
        </strong>,
      );
    } else {
      // In-app links (/shop) stay in the app; outside links open in a new tab.
      const external = !match[3].startsWith("/");
      nodes.push(
        <a
          key={`${key}-a${index}`}
          href={match[3]}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className="text-gold-300 underline underline-offset-4"
        >
          {match[2]}
        </a>,
      );
    }
    last = at + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export default function LessonBody({ body }: { body: string }) {
  const blocks: ReactNode[] = [];
  let pending: { ordered: boolean; items: string[] } | null = null;

  function flush() {
    const list = pending;
    pending = null;
    if (!list) return;
    const key = `l${blocks.length}`;
    const items = list.items.map((item, index) => (
      <li key={index} className="marker:text-[var(--gold-500)]">
        {inline(item, `${key}-${index}`)}
      </li>
    ));
    blocks.push(
      list.ordered ? (
        <ol key={key} className={cn(LIST_CLASS, "list-decimal")}>
          {items}
        </ol>
      ) : (
        <ul key={key} className={cn(LIST_CLASS, "list-disc")}>
          {items}
        </ul>
      ),
    );
  }

  for (const raw of body.split("\n")) {
    const line = raw.trim();
    if (line === "") {
      flush();
      continue;
    }

    const bullet = BULLET.exec(line);
    const numbered = bullet ? null : NUMBERED.exec(line);
    if (bullet || numbered) {
      const ordered = numbered !== null;
      if (pending && pending.ordered !== ordered) flush();
      if (!pending) pending = { ordered, items: [] };
      pending.items.push((bullet ?? numbered)?.[1] ?? "");
      continue;
    }
    flush();

    const image = IMAGE.exec(line);
    if (image) {
      blocks.push(
        // A handful of local files of known size; a loader between them and the
        // screen would buy nothing.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`i${blocks.length}`}
          src={image[2]}
          alt={image[1]}
          className="mt-6 w-full max-w-full rounded-[14px]"
        />,
      );
      continue;
    }

    if (line.startsWith("### ")) {
      blocks.push(
        <p
          key={`h${blocks.length}`}
          className="mt-7 text-[17px] font-semibold text-ink-0"
        >
          {inline(line.slice(4), `h${blocks.length}`)}
        </p>,
      );
      continue;
    }

    if (line.startsWith("## ")) {
      blocks.push(
        <p
          key={`h${blocks.length}`}
          className="eyebrow mt-8 text-gold-300 first:mt-0"
        >
          {inline(line.slice(3), `h${blocks.length}`)}
        </p>,
      );
      continue;
    }

    blocks.push(
      <p
        key={`p${blocks.length}`}
        className="mt-4 text-[17px] leading-relaxed text-ink-1 first:mt-0"
      >
        {inline(line, `p${blocks.length}`)}
      </p>,
    );
  }
  flush();

  return <div className="mt-6">{blocks}</div>;
}
