import { Gauge, Handshake, ScanSearch } from "lucide-react";
import { useTranslation } from "react-i18next";
import Reveal from "../../components/Reveal";

const ICONS = [ScanSearch, Gauge, Handshake] as const;

/** §9: three cards with ghost icons and a lift-on-hover interaction. */
export default function HowItWorks(): JSX.Element {
  const { t } = useTranslation();
  const steps = [
    { num: "01", title: t("landing.how.step1Title"), text: t("landing.how.step1Text") },
    { num: "02", title: t("landing.how.step2Title"), text: t("landing.how.step2Text") },
    { num: "03", title: t("landing.how.step3Title"), text: t("landing.how.step3Text") },
  ];

  return (
    <section id="how" className="hairline-dashed bg-base py-24">
      <div className="guides mx-auto max-w-container px-6">
        <Reveal>
          <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-4xl">
            {t("landing.how.title")}
          </h2>
          <div className="mt-14 grid gap-4 sm:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = ICONS[index];
              return (
                <div
                  key={step.num}
                  tabIndex={0}
                  className="group relative overflow-hidden rounded-2xl border border-line bg-surface p-8 pb-16 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#D4D4D4] hover:shadow-[0_12px_32px_rgba(0,0,0,0.07)] focus-visible:-translate-y-1 focus-visible:border-[#D4D4D4] focus-visible:shadow-[0_12px_32px_rgba(0,0,0,0.07)] focus-visible:outline-none"
                >
                  <p className="text-sm font-semibold text-sub">{step.num}</p>
                  <h3 className="mt-3 text-lg font-semibold tracking-tight">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-sub">{step.text}</p>
                  <Icon
                    size={120}
                    aria-hidden
                    className="absolute -bottom-5 -right-5 text-black opacity-[0.06] transition-all duration-300 ease-out group-hover:scale-[1.04] group-hover:opacity-[0.12] group-focus-visible:scale-[1.04] group-focus-visible:opacity-[0.12]"
                  />
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
