import { useTranslation } from "react-i18next";
import Reveal from "../../components/Reveal";

/** §12.6: the one allowed statistic — oversized centered Gartner quote. */
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
          <p className="mt-6 text-sm text-sub">{t("landing.stat.source")}</p>
          <p className="mt-10 text-xl font-medium">{t("landing.stat.question")}</p>
        </Reveal>
      </div>
    </section>
  );
}
