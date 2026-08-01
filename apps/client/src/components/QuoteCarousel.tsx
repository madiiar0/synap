import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { QUOTES } from "@synapai/shared";
import QuoteMark from "./QuoteMark";

const ADVANCE_MS = 8000;
/** Horizontal travel (px) that counts as a swipe rather than a tap. */
const SWIPE_THRESHOLD = 48;

/** Circular control with a 44px tap target, used on both sides of the card. */
const ARROW_CLS =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-white text-sub shadow-[0_2px_10px_rgba(0,0,0,0.08)] transition-colors hover:border-[#C4C4C4] hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30";

/**
 * §2.4/2.5: quote carousel. Auto-advances every 8s, pauses on hover/focus,
 * dots + prev/next arrows, arrow-key support, swipe on touch, aria-live polite.
 *
 * All content comes from the i18n bundles via `t()`, so switching language
 * updates the visible quote immediately without a reload.
 */
export default function QuoteCarousel(): JSX.Element {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval>>();
  const epoch = useRef(0); // bumped on manual interaction to reset the timer
  const touchStartX = useRef<number | null>(null);

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
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        const start = touchStartX.current;
        touchStartX.current = null;
        if (start === null) return;
        const delta = (e.changedTouches[0]?.clientX ?? start) - start;
        if (Math.abs(delta) < SWIPE_THRESHOLD) return;
        go(index + (delta < 0 ? 1 : -1));
      }}
      className="w-full max-w-2xl outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
    >
      {/* Arrows sit OUTSIDE the card on either side; on narrow screens they
          drop below it, so they can never overlap the quote text. */}
      <div className="flex items-center gap-3 sm:gap-5">
        <button
          type="button"
          aria-label={t("auth.quotePrev")}
          onClick={() => go(index - 1)}
          className={`${ARROW_CLS} hidden sm:flex`}
        >
          <ChevronLeft size={20} />
        </button>

        {/* Every quote occupies the SAME grid cell, so the panel is naturally
            as tall as the longest one at the current width and advancing never
            shifts the layout. No fixed heights, and it holds at every width
            and in both languages. Only the active card is visible or read. */}
        <div aria-live="polite" className="grid min-w-0 flex-1 grid-cols-1 grid-rows-1">
          {QUOTES.map((q, i) => {
            const active = i === index;
            return (
              <div
                key={q.id}
                aria-hidden={!active}
                className={`col-start-1 row-start-1 flex flex-col justify-between rounded-3xl border border-line bg-white p-7 shadow-[0_12px_40px_rgba(0,0,0,0.06)] sm:p-10 ${
                  active ? "quote-in" : "invisible"
                }`}
              >
                <div>
                  <QuoteMark className="text-line" size={36} />
                  <p className="mt-4 text-pretty text-[19px] font-medium leading-[1.5] text-ink sm:text-[22px] sm:leading-[1.45]">
                    {t(`auth.quotes.${q.id}.text`)}
                  </p>
                </div>

                <div className="mt-8 border-t border-line pt-5">
                  <p className="text-[1rem] font-semibold text-ink">{q.author}</p>
                  <p className="mt-1 text-sm leading-snug text-sub">
                    {t(`auth.quotes.${q.id}.role`)}
                  </p>
                  <p className="mt-2 text-sm text-sub">
                    <span className="text-sub/80">{t("auth.netWorth")}:</span>{" "}
                    <span className="font-medium text-ink">
                      {t(`auth.quotes.${q.id}.netWorth`)}
                    </span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          aria-label={t("auth.quoteNext")}
          onClick={() => go(index + 1)}
          className={`${ARROW_CLS} hidden sm:flex`}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Below the card: arrows (narrow screens only) flanking the dots. */}
      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          type="button"
          aria-label={t("auth.quotePrev")}
          onClick={() => go(index - 1)}
          className={`${ARROW_CLS} sm:hidden`}
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex items-center gap-2">
          {QUOTES.map((q, i) => (
            <button
              key={q.id}
              type="button"
              aria-label={`${i + 1} / ${QUOTES.length}`}
              aria-current={i === index}
              onClick={() => go(i)}
              className="flex h-8 w-4 items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
            >
              <span
                className={`h-2 w-2 rounded-full transition-colors ${
                  i === index ? "bg-ink" : "bg-line hover:bg-sub"
                }`}
              />
            </button>
          ))}
        </div>

        <button
          type="button"
          aria-label={t("auth.quoteNext")}
          onClick={() => go(index + 1)}
          className={`${ARROW_CLS} sm:hidden`}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
