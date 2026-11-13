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
  title: "Mounts & Posts | Ocunio Energy",
  description: "Freestanding EV charger posts and pedestals for driveways and car parks where wall mounting isn't possible.",
};

export default async function MountsAndPostsPage() {
  const products = await getHardwareCatalog("Mount");
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <TrustBar />
      <main className="flex-1">
        <PageHero align="left" eyebrow="Accessories" title="Mounts & Posts">
          <p className="mt-3 max-w-2xl text-lg font-semibold text-white">Mount your charger where there&rsquo;s no wall.</p>
          <p className="mt-2 max-w-2xl text-white/70">Freestanding posts and pedestals for driveways and car parks, with the supply cable run up inside for a clean finish.</p>
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
