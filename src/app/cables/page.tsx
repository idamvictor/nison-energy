import type { Metadata } from "next";
import { Suspense } from "react";

import { SiteHeader } from "@/components/shared/site-header";
import { TrustBar } from "@/components/shared/trust-bar";
import { CablesCatalog } from "@/components/cables/cables-catalog";
import { HelpSection } from "@/components/shared/help-section";
import { SiteFooter } from "@/components/shared/site-footer";
import { PageHero } from "@/components/shared/page-hero";
import { getCableCatalog } from "@/lib/catalog/queries";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Cables | Ocunio Energy",
  description: "Pre-cut meter tail packs and EV Ultra installation kits for EV charger installations.",
};

export default async function CablesPage() {
  const products = await getCableCatalog();
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <TrustBar />
      <main className="flex-1">
        <PageHero
          align="left"
          eyebrow="Trade Counter"
          title="Cables"
          subtitle="EV Ultra SWA and Tuff cables from Doncaster cables, meter tails, and complete install kits, used by our own engineers and stocked for the trade."
        />
        <Suspense fallback={null}>
          <CablesCatalog products={products} />
        </Suspense>
        <HelpSection />
      </main>
      <SiteFooter />
    </div>
  );
}
