import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { HeroSection } from "@/components/marketing/HeroSection";
import { FeaturesStrip } from "@/components/marketing/FeaturesStrip";
import { HighlightSection } from "@/components/marketing/HighlightSection";
import { HowItWorksSection } from "@/components/marketing/HowItWorksSection";
import { CtaBanner } from "@/components/marketing/CtaBanner";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <MarketingNav />
      <main className="flex-1">
        <HeroSection />
        <FeaturesStrip />
        <HighlightSection />
        <HowItWorksSection />
        <CtaBanner />
      </main>
      <MarketingFooter />
    </div>
  );
}
