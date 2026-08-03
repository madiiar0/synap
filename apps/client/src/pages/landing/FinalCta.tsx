import { useEffect, useState } from "react";
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
  const [mobile, setMobile] = useState(
    typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const onChange = (): void => setMobile(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const { t } = useTranslation();
  return (
    <section className="hairline-dashed bg-base py-14 sm:py-24">
      <div className="guides mx-auto max-w-container px-4 sm:px-6">
        <Reveal>
          <div
            data-testid="final-cta-card"
            className="relative overflow-hidden rounded-3xl px-5 py-10 text-darktext sm:px-14 sm:py-14"
            style={{
              // §5: horizontal on desktop where the panel sits right; vertical on
              // mobile where it stacks below.
              background: mobile
                ? "linear-gradient(180deg, #0A0A0A 0%, #141414 50%, #2A2A2A 78%, #474747 100%)"
                : "linear-gradient(105deg, #0A0A0A 0%, #141414 50%, #2A2A2A 78%, #474747 100%)",
            }}
          >
            <div className="relative z-10 max-w-lg">
              <h2
                className="font-semibold tracking-tight"
                style={{ fontSize: "clamp(28px, 3.6vw, 44px)", lineHeight: 1.15 }}
              >
                {t("landing.finalCta.title")}
              </h2>
              <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <StartCta
                  label={t("landing.finalCta.start")}
                  className="flex min-h-[48px] items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-ink transition-opacity hover:opacity-90"
                />
                <BookCallButton
                  source="landing"
                  variant="dark-outline"
                  label={t("landing.finalCta.book")}
                />
              </div>
            </div>
            {/* On mobile the oversized panel emerges from the card. The outer
                CTA is the clipping frame, matching the desktop composition. */}
            <div
              data-testid="final-cta-mobile-preview"
              className="pointer-events-none relative z-10 -mb-16 mt-12 w-[calc(100%+9rem)] translate-x-2 origin-top-left rotate-[-2deg] lg:hidden"
            >
              <ProductPreview />
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
