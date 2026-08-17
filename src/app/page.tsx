import { SiteHeader } from "@/components/site-header";
import { TrustBar } from "@/components/trust-bar";
import { Hero } from "@/components/hero";
import { CategoryCards } from "@/components/category-cards";
import { GrantBanner } from "@/components/grant-banner";
import { ProductGrid } from "@/components/product-grid";
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
        <GrantBanner />
        <ProductGrid />
        <HelpSection />
      </main>
      <SiteFooter />
    </div>
  );
}
