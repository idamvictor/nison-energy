import { SiteHeader } from "@/components/shared/site-header";
import { TrustBar } from "@/components/shared/trust-bar";
import { HeroReveal } from "@/components/home/hero-reveal";
import { CategoryCards } from "@/components/home/category-cards";
import { TrustedInstallers } from "@/components/home/trusted-installers";
import { ProductGrid } from "@/components/home/product-grid";
import { FeaturedCommercial } from "@/components/home/featured-commercial";
import { FeaturedAccessories } from "@/components/home/featured-accessories";
import { LatestBlog } from "@/components/home/latest-blog";
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
        <HeroReveal>
          <ProductGrid
            limit={3}
            viewAllHref="/home-charging"
            title="Our Best-Selling Chargers"
            subtitle="A curated selection of our best-selling chargers."
          />
        </HeroReveal>
        <FeaturedCommercial limit={3} />
        <FeaturedAccessories limit={3} />
        <CategoryCards />
        <TrustedInstallers />
        <LatestBlog limit={3} />
        <GrantBanner />
        <FaqSection />
        <HelpSection />
      </main>
      <SiteFooter />
    </div>
  );
}
