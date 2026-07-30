import FaqSection from "./landing/FaqSection";
import FearLine from "./landing/FearLine";
import FinalCta from "./landing/FinalCta";
import Hero from "./landing/Hero";
import HowItWorks from "./landing/HowItWorks";
import LandingFooter from "./landing/LandingFooter";
import LandingNav from "./landing/LandingNav";
import MockAnswer from "./landing/MockAnswer";
import ProductPreview from "./landing/ProductPreview";
import PromptMarquee from "./landing/PromptMarquee";
import StatQuote from "./landing/StatQuote";
import Reveal from "../components/Reveal";

/** §12 landing: dark hero → light sections separated by dashed hairlines. */
export default function Landing(): JSX.Element {
  return (
    <div className="bg-base text-ink">
      <LandingNav />
      <Hero />
      <FearLine />
      <MockAnswer />
      <PromptMarquee />
      <HowItWorks />
      <StatQuote />
      <section id="product" className="hairline-dashed bg-base py-24">
        <div className="guides mx-auto flex max-w-container justify-center px-6">
          <Reveal>
            <ProductPreview />
          </Reveal>
        </div>
      </section>
      <FaqSection />
      <FinalCta />
      <LandingFooter />
    </div>
  );
}
