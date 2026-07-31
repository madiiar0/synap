import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { AI_PLATFORMS } from "@synapai/shared";
import BookCallButton from "../../components/BookCallButton";
import { AI_LOGOS } from "../../lib/aiLogos";

const HOLD_MS = 3500;

/**
 * §4 hero platform cycle: iterates ALL platforms in the registry (including
 * display-only), 3.5s hold, 900ms overlapping blur crossfade. All names are
 * stacked in one grid cell so the slot always has the width of the widest —
 * cycling never shifts layout.
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
    <span data-testid="cycling-engine" className="inline-grid h-[1.15em] align-bottom">
      {AI_PLATFORMS.map((platform, i) => {
        const state = i === index ? "in" : i === prevIndex ? "out" : "off";
        return (
          <span
            key={platform.id}
            aria-hidden={state !== "in"}
            className={`col-start-1 row-start-1 inline-flex items-center gap-[0.22em] whitespace-nowrap ${
              state === "in" ? "hero-swap-in" : state === "out" ? "hero-swap-out" : "invisible"
            }`}
          >
            <img
              src={AI_LOGOS[platform.id]}
              alt=""
              className="h-[0.82em] w-auto shrink-0 object-contain"
            />
            {platform.name}
          </span>
        );
      })}
    </span>
  );
}

/** §4: light hero, exactly two lines, no form (the form lives at /scan). */
export default function Hero(): JSX.Element {
  const { t } = useTranslation();
  return (
    <header className="bg-base pb-24 pt-40 text-ink">
      <div className="guides mx-auto max-w-container px-6">
        <div className="mx-auto max-w-5xl text-center">
          <h1
            className="font-semibold tracking-tight"
            style={{ fontSize: "clamp(24px, 6.2vw, 84px)", lineHeight: 1.12 }}
          >
            <span className="block">{t("landing.heroLine1")}</span>
            <span className="flex items-center justify-center gap-[0.28em]">
              {t("landing.heroLine2")} <CyclingPlatform />
            </span>
          </h1>
          <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-sub">
            {t("landing.heroSub1")}
            <br />
            {t("landing.heroSub2")}
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/scan"
              className="rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-85"
            >
              {t("landing.ctaCheckFree")}
            </Link>
            <BookCallButton source="landing" variant="secondary" />
          </div>
        </div>
      </div>
    </header>
  );
}
