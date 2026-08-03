import FaqSection from "./landing/FaqSection";
import FearLine from "./landing/FearLine";
import FinalCta from "./landing/FinalCta";
import Hero from "./landing/Hero";
import HowItWorks from "./landing/HowItWorks";
import LandingFooter from "./landing/LandingFooter";
import LandingNav from "./landing/LandingNav";
import MockAnswer from "./landing/MockAnswer";
import PromptMarquee from "./landing/PromptMarquee";
import StatQuote from "./landing/StatQuote";
import { PublicPageMetadata } from "../components/PageMetadata";
import { currentLocale } from "../lib/i18n";
import { useEffect } from "react";
import { trackPublicEvent } from "../lib/publicAnalytics";

/**
 * §Global: light theme throughout; dark is reserved for the final CTA card.
 * The fear line + mock answer form one narrative block (#product).
 */
export default function Landing(): JSX.Element {
  useEffect(() => trackPublicEvent("page_view", "/"), []);
  return (
    <div className="bg-base text-ink">
      <PublicPageMetadata path="/" locale={currentLocale()} />
      <LandingNav />
      <main>
        <Hero />
        <section id="product">
          <FearLine />
          <MockAnswer />
        </section>
        <PromptMarquee />
        <HowItWorks />
        <StatQuote />
        <FaqSection />
        <FinalCta />
      </main>
      <LandingFooter />
    </div>
  );
}
