import { SiteHeader } from "@/components/shared/site-header";
import { TrustBar } from "@/components/shared/trust-bar";
import { HeroReveal } from "@/components/home/hero-reveal";
import { TrustedInstallers } from "@/components/home/trusted-installers";
import { StatsSection } from "@/components/home/stats-section";
import { ProductGrid } from "@/components/home/product-grid";
import { GrantBanner } from "@/components/home/grant-banner";
import { FaqSection } from "@/components/home/faq-section";
import { HelpSection } from "@/components/shared/help-section";
import { SiteFooter } from "@/components/shared/site-footer";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <TrustBar />
      <main className="flex-1">
        <HeroReveal />
        <ProductGrid
          limit={3}
          viewAllHref="/home-charging"
          title="Featured Residential Chargers"
          subtitle="A few favourites from our home charging range."
        />
        <TrustedInstallers />
        <StatsSection />
        <GrantBanner />
        <FaqSection />
        <HelpSection />
      </main>
      <SiteFooter />
    </div>
  );
}
