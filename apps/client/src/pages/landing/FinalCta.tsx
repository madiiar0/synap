import { useTranslation } from "react-i18next";
import BookCallButton from "../../components/BookCallButton";
import Reveal from "../../components/Reveal";
import ProductPreview from "./ProductPreview";

import StartCta from "../../components/StartCta";

/**
 * §12: the ONLY dark surface on the site: a gradient CTA card whose right
 * side lightens behind the elevated rankings preview.
 */
export default function FinalCta(): JSX.Element {
  const { t } = useTranslation();
  return (
    <section className="hairline-dashed bg-base py-24">
      <div className="guides mx-auto max-w-container px-6">
        <Reveal>
          <div
            className="relative overflow-hidden rounded-3xl px-8 py-14 text-darktext sm:px-14"
            style={{
              background:
                "linear-gradient(105deg, #0A0A0A 0%, #141414 50%, #2A2A2A 78%, #474747 100%)",
            }}
          >
            <div className="relative z-10 max-w-lg">
              <h2
                className="font-semibold tracking-tight"
                style={{ fontSize: "clamp(28px, 3.6vw, 44px)", lineHeight: 1.15 }}
              >
                {t("landing.finalCta.title")}
              </h2>
              <div className="mt-8 flex flex-wrap gap-3">
                <StartCta
                  label={t("landing.finalCta.start")}
                  className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink transition-opacity hover:opacity-90"
                />
                <BookCallButton
                  source="landing"
                  variant="dark-outline"
                  label={t("landing.finalCta.book")}
                />
              </div>
            </div>
            {/* preview peeking from the right edge, slightly elevated */}
            <div className="pointer-events-none absolute -right-20 top-1/2 hidden w-[520px] -translate-y-1/3 rotate-[-1deg] lg:block">
              <ProductPreview />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
