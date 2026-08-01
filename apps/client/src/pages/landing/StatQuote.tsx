import { useTranslation } from "react-i18next";
import BookCallButton from "../../components/BookCallButton";
import QuoteMark from "../../components/QuoteMark";
import Reveal from "../../components/Reveal";

import StartCta from "../../components/StartCta";

/** §10: localized Gartner quote + credibility caption + question + CTAs. */
export default function StatQuote(): JSX.Element {
  const { t } = useTranslation();
  return (
    <section className="hairline-dashed bg-base py-28 sm:py-36">
      <div className="guides mx-auto max-w-container px-6">
        <Reveal className="mx-auto max-w-4xl text-center">
          {/* §5: ONE decorative mark for both languages. The localized string
              carries no quote glyphs, so RU and EN render identically. */}
          <QuoteMark className="mx-auto text-line" size={48} />
          <blockquote
            className="mt-5 text-balance font-semibold tracking-tight text-ink"
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
          <div className="mt-7 flex w-full flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
            <StartCta
              label={t("landing.ctaCheckFree")}
              className="flex min-h-[48px] items-center justify-center rounded-full bg-ink px-7 text-sm font-semibold text-white transition-opacity hover:opacity-85"
            />
            <BookCallButton source="landing" variant="secondary" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
