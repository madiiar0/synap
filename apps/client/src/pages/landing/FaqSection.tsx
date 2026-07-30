import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Reveal from "../../components/Reveal";

/** §12.8: 6-item accordion with hairline dividers and rotating chevrons. */
export default function FaqSection(): JSX.Element {
  const { t } = useTranslation();
  const [open, setOpen] = useState<number | null>(null);
  const items = [1, 2, 3, 4, 5, 6].map((n) => ({
    q: t(`landing.faq.q${n}`),
    a: t(`landing.faq.a${n}`),
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
              <div key={index} className="border-b border-line">
                <button
                  type="button"
                  aria-expanded={open === index}
                  onClick={() => setOpen((current) => (current === index ? null : index))}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="text-[15px] font-medium">{item.q}</span>
                  <ChevronDown
                    size={17}
                    className={`shrink-0 text-sub transition-transform duration-300 ${
                      open === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {open === index && (
                  <p className="pb-5 pr-8 text-sm leading-relaxed text-sub">{item.a}</p>
                )}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
