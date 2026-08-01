import { useTranslation } from "react-i18next";
import BookCallButton from "../../components/BookCallButton";
import Reveal from "../../components/Reveal";

import StartCta from "../../components/StartCta";

/** §10: localized Gartner quote + credibility caption + question + CTAs. */
export default function StatQuote(): JSX.Element {
  const { t } = useTranslation();
  return (
    <section className="hairline-dashed bg-base py-28 sm:py-36">
      <div className="guides mx-auto max-w-container px-6">
        <Reveal className="mx-auto max-w-4xl text-center">
          <blockquote
            className="font-semibold tracking-tight text-ink"
            style={{ fontSize: "clamp(28px, 4.4vw, 54px)", lineHeight: 1.18 }}
          >
            {t("landing.stat.quote")}
          </blockquote>
          <p className="mx-auto mt-6 max-w-xl text-sm text-sub">
            {t("landing.stat.sourceLine")}
          </p>
          <p className="mt-12 text-2xl font-medium text-ink sm:text-3xl">
            {t("landing.stat.question")}
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <StartCta
              label={t("landing.ctaCheckFree")}
              className="rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-85"
            />
            <BookCallButton source="landing" variant="secondary" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
