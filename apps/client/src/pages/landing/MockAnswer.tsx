import { useTranslation } from "react-i18next";
import Reveal from "../../components/Reveal";
import { AI_LOGOS } from "../../lib/aiLogos";

// §6+7: real chain names are allowed ONLY here, with neutral descriptions.
const SHOPS = ["Global Coffee", "Master Coffee", "Coffee Boom"] as const;

/** Chat-style ChatGPT mock answer (coffee niche, reference density). */
export default function MockAnswer(): JSX.Element {
  const { t } = useTranslation();
  const blurbs = [
    t("landing.mockAnswer.blurb1"),
    t("landing.mockAnswer.blurb2"),
    t("landing.mockAnswer.blurb3"),
  ];

  return (
    <div className="bg-base pb-24 pt-0">
      <div className="guides mx-auto max-w-container px-6">
        <Reveal className="mx-auto max-w-2xl">
          {/* user bubble */}
          <div className="flex justify-end">
            <div className="rounded-2xl rounded-br-md border border-line bg-surface px-5 py-3.5 text-sm shadow-sm">
              {t("landing.mockAnswer.userQuestion")}
            </div>
          </div>

          {/* assistant card */}
          <div className="mt-4 flex items-start gap-3">
            <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-surface">
              <img src={AI_LOGOS.chatgpt} alt="ChatGPT" className="h-5 w-5 object-contain" />
            </div>
            <div className="flex-1 rounded-2xl rounded-tl-md border border-line bg-surface p-6 shadow-sm">
              <p className="text-sm leading-relaxed text-sub">{t("landing.mockAnswer.intro")}</p>
              <div className="mt-4 border-t border-line" />
              {SHOPS.map((name, index) => (
                <div
                  key={name}
                  className={`flex items-start gap-3 ${
                    index > 0 ? "mt-4 border-t border-line pt-4" : "mt-4"
                  }`}
                >
                  <span className="mt-0.5 shrink-0 rounded-lg border border-line px-2 py-0.5 text-xs font-semibold text-sub">
                    #{index + 1}
                  </span>
                  {/* brand-initial square — we do not invent logos for real companies */}
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-line bg-base text-xs font-bold text-ink">
                    {name.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{name}</p>
                    <p className="mt-1 text-sm leading-relaxed text-sub">{blurbs[index]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-sub">{t("landing.mockAnswer.caption")}</p>
        </Reveal>
      </div>
    </div>
  );
}
