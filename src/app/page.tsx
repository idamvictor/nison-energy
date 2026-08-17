import { SiteHeader } from "@/components/site-header";
import { TrustBar } from "@/components/trust-bar";
import { Hero } from "@/components/hero";
import { CategoryCards } from "@/components/category-cards";
import { ThreeSteps } from "@/components/three-steps";
import { GrantBanner } from "@/components/grant-banner";
import { TrustedInstallers } from "@/components/trusted-installers";
import { ProductGrid } from "@/components/product-grid";
import { FaqSection } from "@/components/faq-section";
import { HelpSection } from "@/components/help-section";
import { SiteFooter } from "@/components/site-footer";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <TrustBar />
      <main className="flex-1">
        <Hero />
        <CategoryCards />
        <ThreeSteps />
        <GrantBanner />
        <TrustedInstallers />
        <ProductGrid
          limit={4}
          viewAllHref="/home-charging"
          title="Featured home chargers"
          subtitle="A few favourites from our home charging range."
        />
        <FaqSection />
        <HelpSection />
      </main>
      <SiteFooter />
    </div>
  );
}
