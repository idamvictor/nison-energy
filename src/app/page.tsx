import { SiteHeader } from "@/components/site-header";
import { TrustBar } from "@/components/trust-bar";
import { HeroReveal } from "@/components/hero-reveal";
import { TrustedInstallers } from "@/components/trusted-installers";
import { ThreeSteps } from "@/components/three-steps";
import { StatsSection } from "@/components/stats-section";
import { ProductGrid } from "@/components/product-grid";
import { GrantBanner } from "@/components/grant-banner";
import { FaqSection } from "@/components/faq-section";
import { HelpSection } from "@/components/help-section";
import { SiteFooter } from "@/components/site-footer";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <TrustBar />
      <main className="flex-1">
        <HeroReveal />
        <TrustedInstallers />
        <ThreeSteps />
        <StatsSection />
        <ProductGrid
          limit={3}
          viewAllHref="/home-charging"
          title="Featured Home Chargers"
          subtitle="A few favourites from our home charging range."
        />
        <GrantBanner />
        <FaqSection />
        <HelpSection />
      </main>
      <SiteFooter />
    </div>
  );
}
