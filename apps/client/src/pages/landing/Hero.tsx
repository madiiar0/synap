import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AI_PLATFORMS } from "@synapai/shared";
import BookCallButton from "../../components/BookCallButton";
import { AI_LOGOS } from "../../lib/aiLogos";

import StartCta from "../../components/StartCta";

const HOLD_MS = 3500;

/**
 * §3 hero cycle: line 2 is its own centered line ([logo] [Name]); every
 * platform is absolutely stacked in a fixed-height full-width row, so short
 * (Grok) and long (Perplexity) names stay optically centered with zero
 * layout shift. 3.5s hold, 900ms overlapping blur crossfade.
 */
export function CyclingPlatform(): JSX.Element {
  const [index, setIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    timer.current = setInterval(() => {
      setIndex((current) => {
        setPrevIndex(current);
        return (current + 1) % AI_PLATFORMS.length;
      });
    }, HOLD_MS);
    return () => clearInterval(timer.current);
  }, []);

  return (
    <span data-testid="cycling-engine" className="relative block h-[1.2em] w-full">
      {AI_PLATFORMS.map((platform, i) => {
        const state = i === index ? "in" : i === prevIndex ? "out" : "off";
        return (
          <span
            key={platform.id}
            aria-hidden={state !== "in"}
            className={`absolute inset-0 inline-flex items-center justify-center gap-[0.28em] whitespace-nowrap ${
              state === "in" ? "hero-swap-in" : state === "out" ? "hero-swap-out" : "invisible"
            }`}
          >
            <img
              src={AI_LOGOS[platform.id]}
              alt={platform.name}
              className="h-[0.78em] w-auto shrink-0 object-contain"
            />
            {platform.name}
          </span>
        );
      })}
    </span>
  );
}

/** §3: light hero, vertically centered in the viewport minus the navbar. */
export default function Hero(): JSX.Element {
  const { t } = useTranslation();
  return (
    <header
      className="flex min-h-[calc(100svh-var(--nav-h))] flex-col items-center justify-center bg-base text-ink"
      style={{ marginTop: "var(--nav-h)" }}
    >
      <div className="guides mx-auto w-full max-w-container px-6 py-16">
        <div className="mx-auto max-w-5xl text-center">
          <h1
            className="font-semibold tracking-tight"
            style={{ fontSize: "clamp(38px, 9.2vw, 84px)", lineHeight: 1.1 }}
          >
            <span className="block">{t("landing.heroLine1")}</span>
            <CyclingPlatform />
          </h1>
          {/* §3: one string, wrapped by the browser. `text-pretty` keeps a
              single short word off a line of its own without hard breaks. */}
          <p className="mx-auto mt-8 max-w-[34rem] text-pretty text-lg leading-relaxed text-sub">
            {t("landing.heroSub")}
          </p>
          <div className="mt-9 flex w-full flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
            <StartCta
              label={t("landing.ctaCheckFree")}
              className="flex min-h-[48px] items-center justify-center rounded-full bg-ink px-7 text-sm font-semibold text-white transition-opacity hover:opacity-85"
            />
            <BookCallButton source="landing" variant="secondary" />
          </div>
        </div>
      </div>
    </header>
  );
}
