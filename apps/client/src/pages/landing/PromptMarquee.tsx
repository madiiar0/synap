import { useTranslation } from "react-i18next";
import { MARQUEE_ROW_1, MARQUEE_ROW_2, type MarqueeChip } from "@synapai/shared";
import EngineMark from "../../components/EngineMark";
import Reveal from "../../components/Reveal";

function Row({ chips, reverse }: { chips: MarqueeChip[]; reverse?: boolean }): JSX.Element {
  // Track duplicated once for a seamless -50% loop.
  const doubled = [...chips, ...chips];
  return (
    <div className="marquee-row overflow-hidden">
      <div className={`marquee-track gap-3 py-2 ${reverse ? "marquee-reverse" : ""}`}>
        {doubled.map((chip, index) => (
          <span
            key={`${chip.text}-${index}`}
            className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-line bg-surface px-4 py-2 text-sm text-ink shadow-sm"
          >
            <EngineMark engine={chip.engine} size={13} withLabel={false} className="text-sub" />
            {chip.text}
          </span>
        ))}
      </div>
    </div>
  );
}

/** §12.4: two prompt-chip rows scrolling in opposite directions. */
export default function PromptMarquee(): JSX.Element {
  const { t } = useTranslation();
  return (
    <section className="hairline-dashed overflow-hidden bg-base py-24">
      <Reveal className="mx-auto max-w-container px-6 text-center">
        <h2
          className="mx-auto max-w-3xl font-semibold tracking-tight"
          style={{ fontSize: "clamp(26px, 3.4vw, 44px)", lineHeight: 1.2 }}
        >
          {t("landing.marquee.heading1")}
          <br />
          {t("landing.marquee.heading2")}
        </h2>
      </Reveal>
      <div className="mt-12 space-y-3">
        <Row chips={MARQUEE_ROW_1} />
        <Row chips={MARQUEE_ROW_2} reverse />
      </div>
    </section>
  );
}
