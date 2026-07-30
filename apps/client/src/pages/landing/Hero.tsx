import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ENGINE_LABELS, type EngineId } from "@synapai/shared";
import BookCallButton from "../../components/BookCallButton";
import EngineMark from "../../components/EngineMark";
import ScanForm from "./ScanForm";

/** Fixed-line-height cycling engine name with a 500ms blur swap every 2.2s. */
export function CyclingEngine(): JSX.Element {
  const order: EngineId[] = ["chatgpt", "claude", "gemini", "perplexity"];
  const [index, setIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    timer.current = setInterval(() => setIndex((i) => (i + 1) % order.length), 2200);
    return () => clearInterval(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const engine = order[index];
  return (
    <span
      data-testid="cycling-engine"
      className="block h-[1.15em] overflow-visible"
      aria-live="off"
    >
      <span key={engine} className="blur-in inline-flex items-center gap-[0.28em]">
        <EngineMark engine={engine} size={52} withLabel={false} className="mt-1 shrink-0" />
        {ENGINE_LABELS[engine]}
      </span>
    </span>
  );
}

export default function Hero(): JSX.Element {
  const { t } = useTranslation();
  return (
    <header className="dark-section bg-dark pb-24 pt-36 text-darktext">
      <div className="guides guides-dark mx-auto max-w-container px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h1
            className="font-semibold tracking-tight"
            style={{ fontSize: "clamp(44px, 7vw, 88px)", lineHeight: 1.08 }}
          >
            {t("landing.heroLine1")}
            <CyclingEngine />
          </h1>
          <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-sub">
            {t("landing.heroSub1")}
            <br />
            {t("landing.heroSub2")}
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#scan-form"
              className="rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-ink transition-opacity hover:opacity-90"
            >
              {t("landing.ctaCheckFree")}
            </a>
            <BookCallButton
              source="landing"
              variant="secondary"
              className="!border-darkline !text-darktext hover:!bg-white/5"
            />
          </div>
        </div>
        <div className="mt-20">
          <ScanForm />
        </div>
      </div>
    </header>
  );
}
