import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { GrantBanner } from "@/components/grant-banner";
import { ProductGrid } from "@/components/product-grid";
import { HelpSection } from "@/components/help-section";
import { SiteFooter } from "@/components/site-footer";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <GrantBanner />
        <ProductGrid />
        <HelpSection />
      </main>
      <SiteFooter />
    </div>
  );
}
