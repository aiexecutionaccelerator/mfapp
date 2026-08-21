import type { StoicQuote } from "@/content/stoicQuotes";

/**
 * One Stoic line for the Mission Active screen. Fades in slowly from the side
 * — text first, attribution a beat later — like a title card.
 */
export default function StoicQuoteBlock({ quote }: { quote: StoicQuote }) {
  return (
    <figure className="mt-10" aria-label={`Quote from ${quote.author}`}>
      <div
        aria-hidden
        className="quote-rule h-px w-12"
        style={{ background: "linear-gradient(90deg,#E8D28A,#8F6E1E)" }}
      />
      <blockquote className="quote-reveal mt-5">
        <p className="text-[21px] leading-[1.4] text-ink-0">
          <span className="font-display mr-1 inline-block text-[34px] leading-[0] text-gold-300 align-[-0.22em]">
            &ldquo;
          </span>
          {quote.text}
        </p>
      </blockquote>
      <figcaption className="quote-reveal quote-reveal-delay mt-4 text-[12px] tracking-[0.16em] text-gold-300 uppercase">
        {quote.author}
        <span className="text-ink-2"> · {quote.source}</span>
      </figcaption>
    </figure>
  );
}
