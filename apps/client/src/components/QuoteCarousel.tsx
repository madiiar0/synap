import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { QUOTES } from "@synapai/shared";
import { currentLocale } from "../lib/i18n";

const ADVANCE_MS = 8000;

/**
 * §2.4/2.5: verified-quotes carousel. Auto-advances every 8s, pauses on
 * hover/focus, dots + prev/next arrows, arrow-key support, aria-live polite.
 * Every quote is web-verified and links to its public source.
 */
export default function QuoteCarousel(): JSX.Element {
  const { t } = useTranslation();
  const locale = currentLocale();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval>>();
  const epoch = useRef(0); // bumped on manual interaction to reset the timer

  const go = useCallback((next: number) => {
    epoch.current += 1;
    setIndex(((next % QUOTES.length) + QUOTES.length) % QUOTES.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const startedEpoch = epoch.current;
    timer.current = setInterval(() => {
      if (epoch.current === startedEpoch) {
        setIndex((i) => (i + 1) % QUOTES.length);
      }
    }, ADVANCE_MS);
    return () => clearInterval(timer.current);
  }, [paused, index]);

  const quote = QUOTES[index];

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={t("auth.title")}
      tabIndex={0}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") go(index - 1);
        if (e.key === "ArrowRight") go(index + 1);
      }}
      className="w-full max-w-md outline-none"
    >
      <div aria-live="polite">
        <div
          key={quote.id}
          className="quote-in rounded-2xl border border-line bg-white p-8 shadow-[0_12px_40px_rgba(0,0,0,0.06)]"
        >
          <p className="text-lg font-medium leading-relaxed text-ink">
            {locale === "ru" ? `«${quote.text.ru}»` : `“${quote.text.en}”`}
          </p>
          <div className="mt-6 border-t border-line pt-4">
            <p className="text-sm font-semibold text-ink">{quote.author}</p>
            <p className="text-sm text-sub">
              {quote.role}, {quote.company}
            </p>
            <p className="mt-1 text-xs text-sub">{quote.companyValue[locale]}</p>
            <a
              href={quote.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs text-sub underline underline-offset-2 hover:text-ink"
            >
              <ExternalLink size={11} aria-hidden />
              {t("auth.quoteSource")}
            </a>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous"
          onClick={() => go(index - 1)}
          className="rounded-full border border-line bg-white p-2 text-sub transition-colors hover:text-ink"
        >
          <ChevronLeft size={15} />
        </button>
        <div className="flex items-center gap-2">
          {QUOTES.map((q, i) => (
            <button
              key={q.id}
              type="button"
              aria-label={`${i + 1} / ${QUOTES.length}`}
              aria-current={i === index}
              onClick={() => go(i)}
              className={`h-2 w-2 rounded-full transition-colors ${
                i === index ? "bg-ink" : "bg-line hover:bg-sub"
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          aria-label="Next"
          onClick={() => go(index + 1)}
          className="rounded-full border border-line bg-white p-2 text-sub transition-colors hover:text-ink"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
