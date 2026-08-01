import { useTranslation } from "react-i18next";
import { marqueeRows, type MarqueeChip } from "@synapai/shared";
import EngineMark from "../../components/EngineMark";
import Reveal from "../../components/Reveal";
import { currentLocale } from "../../lib/i18n";

function Row({
  chips,
  direction,
  duration,
}: {
  chips: MarqueeChip[];
  direction: "left" | "right";
  duration: string;
}): JSX.Element {
  // Track duplicated once for a seamless -50% loop.
  const doubled = [...chips, ...chips];
  return (
    <div className="marquee-row overflow-hidden">
      <div
        className="marquee-track gap-3 py-2"
        style={{
          animationDuration: duration,
          animationDirection: direction === "right" ? "reverse" : "normal",
        }}
      >
        {doubled.map((chip, index) => (
          <span
            key={`${chip.text}-${index}`}
            className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-line bg-surface px-3.5 py-2 text-xs text-ink shadow-sm sm:gap-2.5 sm:px-5 sm:py-3 sm:text-base lg:text-lg"
          >
            <EngineMark engine={chip.platform} size={24} withLabel={false} />
            {chip.text}
          </span>
        ))}
      </div>
    </div>
  );
}

/** §8: three localized prompt rows: right / left / right, varied speeds. */
export default function PromptMarquee(): JSX.Element {
  const { t } = useTranslation();
  const locale = currentLocale();
  const [row1, row2, row3] = marqueeRows(locale);

  return (
    <section className="hairline-dashed overflow-hidden bg-base py-14 sm:py-24">
      <Reveal className="mx-auto max-w-container px-6 text-center">
        {/* §6: RU wraps to three lines, EN keeps exactly two. */}
        <h2
          className={`mx-auto font-semibold tracking-tight ${
            locale === "ru" ? "max-w-[760px]" : "max-w-[1020px]"
          }`}
          style={{ fontSize: "clamp(26px, 3.4vw, 44px)", lineHeight: 1.2 }}
        >
          {t("landing.marquee.heading1")}
          <br />
          {t("landing.marquee.heading2")}
        </h2>
      </Reveal>
      <div className="mt-12 space-y-3">
        <Row chips={row1} direction="right" duration="42s" />
        <Row chips={row2} direction="left" duration="50s" />
        <Row chips={row3} direction="right" duration="46s" />
      </div>
    </section>
  );
}
