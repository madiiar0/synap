import { useTranslation } from "react-i18next";
import Reveal from "../../components/Reveal";
import EngineMark from "../../components/EngineMark";

const DEMO_BRANDS = ["Astra", "Nurly", "Vega"] as const;

/** §12.3: chat-style mock AI answer with three fictional demo brands. */
export default function MockAnswer(): JSX.Element {
  const { t } = useTranslation();
  const blurbs = [
    t("landing.mockAnswer.blurb1"),
    t("landing.mockAnswer.blurb2"),
    t("landing.mockAnswer.blurb3"),
  ];

  return (
    <section className="hairline-dashed bg-base py-24">
      <div className="guides mx-auto max-w-container px-6">
        <Reveal className="mx-auto max-w-2xl">
          {/* user bubble */}
          <div className="flex justify-end">
            <div className="rounded-2xl rounded-br-md border border-line bg-surface px-5 py-3.5 text-sm shadow-sm">
              {t("landing.mockAnswer.userQuestion", {
                category: t("landing.mockAnswer.sampleCategory"),
              })}
            </div>
          </div>

          {/* assistant card */}
          <div className="mt-4 flex items-start gap-3">
            <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-white">
              <EngineMark engine="chatgpt" size={16} withLabel={false} />
            </div>
            <div className="flex-1 rounded-2xl rounded-tl-md border border-line bg-surface p-6 shadow-sm">
              {DEMO_BRANDS.map((brand, index) => (
                <div
                  key={brand}
                  className={`flex gap-3 ${index > 0 ? "mt-5 border-t border-line pt-5" : ""}`}
                >
                  <span className="shrink-0 rounded-lg border border-line px-2 py-0.5 text-xs font-semibold text-sub">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{brand}</p>
                    <p className="mt-1 text-sm leading-relaxed text-sub">{blurbs[index]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-sub">{t("landing.mockAnswer.caption")}</p>
        </Reveal>
      </div>
    </section>
  );
}
