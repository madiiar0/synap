import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import Reveal from "../../components/Reveal";

/** §12.8: 6-item accordion with hairline dividers and rotating chevrons. */
export default function FaqSection(): JSX.Element {
  const { t } = useTranslation();
  const items = [1, 2, 3, 4, 5, 6].map((number) => ({
    question: t(`landing.faq.q${number}`),
    answer: t(`landing.faq.a${number}`),
  }));

  return (
    <section id="faq" className="hairline-dashed bg-base py-24">
      <div className="guides mx-auto max-w-container px-6">
        <Reveal className="mx-auto max-w-2xl">
          <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-4xl">
            {t("landing.faq.title")}
          </h2>
          <div className="mt-12 border-t border-line">
            {items.map((item, index) => (
              <details key={index} className="group border-b border-line">
                <summary className="flex w-full cursor-pointer list-none items-center justify-between gap-4 py-5 text-left marker:hidden">
                  <span className="text-[15px] font-medium">{item.question}</span>
                  <ChevronDown
                    size={17}
                    className="shrink-0 text-sub transition-transform duration-300 group-open:rotate-180"
                  />
                </summary>
                <p className="pb-5 pr-8 text-sm leading-relaxed text-sub">{item.answer}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
