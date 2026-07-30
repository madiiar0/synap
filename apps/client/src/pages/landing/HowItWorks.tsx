import { useTranslation } from "react-i18next";
import Reveal from "../../components/Reveal";

/** §12.5: three numbered columns on a hairline grid. */
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
          <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
            {steps.map((step) => (
              <div key={step.num} className="bg-surface p-8">
                <p className="text-sm font-semibold text-sub">{step.num}</p>
                <h3 className="mt-3 text-lg font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-sub">{step.text}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
