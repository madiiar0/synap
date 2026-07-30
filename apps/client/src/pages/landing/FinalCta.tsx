import { useTranslation } from "react-i18next";
import BookCallButton from "../../components/BookCallButton";
import Reveal from "../../components/Reveal";
import ProductPreview from "./ProductPreview";

/** §12.9: dark CTA card inside the light section, preview peeking at an angle. */
export default function FinalCta(): JSX.Element {
  const { t } = useTranslation();
  return (
    <section className="hairline-dashed bg-base py-24">
      <div className="guides mx-auto max-w-container px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-dark px-8 py-14 text-darktext sm:px-14">
            <div className="relative z-10 max-w-lg">
              <h2
                className="font-semibold tracking-tight"
                style={{ fontSize: "clamp(28px, 3.6vw, 44px)", lineHeight: 1.15 }}
              >
                {t("landing.finalCta.title")}
              </h2>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#scan-form"
                  className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink transition-opacity hover:opacity-90"
                >
                  {t("landing.finalCta.start")}
                </a>
                <BookCallButton
                  source="landing"
                  variant="secondary"
                  label={t("landing.finalCta.book")}
                  className="!border-darkline !text-darktext hover:!bg-white/5"
                />
              </div>
            </div>
            {/* preview peeking from the right edge */}
            <div className="pointer-events-none absolute -right-24 top-1/2 hidden w-[560px] -translate-y-1/3 opacity-90 lg:block">
              <ProductPreview />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
