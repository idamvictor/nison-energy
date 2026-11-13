import type { Metadata } from "next";
import { Suspense } from "react";

import { SiteHeader } from "@/components/shared/site-header";
import { TrustBar } from "@/components/shared/trust-bar";
import { HardwareCatalog } from "@/components/charger-accessories/hardware-catalog";
import { HelpSection } from "@/components/shared/help-section";
import { SiteFooter } from "@/components/shared/site-footer";
import { PageHero } from "@/components/shared/page-hero";
import { getHardwareCatalog } from "@/lib/catalog/queries";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Covers | Ocunio Energy",
  description: "Clip-on front fascias to match your EV charger to your home.",
};

export default async function CoversPage() {
  const products = await getHardwareCatalog("Cover");
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <TrustBar />
      <main className="flex-1">
        <PageHero align="left" eyebrow="Accessories" title="Covers">
          <p className="mt-3 max-w-2xl text-lg font-semibold text-white">Change the look of your charger in seconds.</p>
          <p className="mt-2 max-w-2xl text-white/70">Clip-on front covers in a range of colours, so your charger matches your doors, cladding or brickwork. No tools needed.</p>
        </PageHero>
        <Suspense fallback={null}>
          <HardwareCatalog products={products} />
        </Suspense>
        <HelpSection />
      </main>
      <SiteFooter />
    </div>
  );
}
