import type { Metadata } from "next";
import { Suspense } from "react";

import { SiteHeader } from "@/components/shared/site-header";
import { TrustBar } from "@/components/shared/trust-bar";
import { AccessoriesCatalog } from "@/components/accessories/accessories-catalog";
import { HelpSection } from "@/components/shared/help-section";
import { SiteFooter } from "@/components/shared/site-footer";
import { PageHero } from "@/components/shared/page-hero";
import { getAccessoryCatalog } from "@/lib/catalog/queries";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Accessories | Ocunio Energy",
  description:
    "Type 2 EV charging cables in coiled or straight styles, discreet grey or hi-vis lime green, for single-phase and three-phase charging.",
};

export default async function AccessoriesPage() {
  const products = await getAccessoryCatalog();
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <TrustBar />
      <main className="flex-1">
        <PageHero
          align="left"
          eyebrow="Cables & accessories"
          title="Accessories"
          subtitle="Get more from your EV charging setup with our range of smart, practical and accessories."
        >
          <p className="mt-3 max-w-2xl text-white/70">
            Whether you&apos;re installing a new charger or enhancing an existing system, we have the essential extras
            to help you get the most from your setup. From home charging to workplace and commercial installations, find
            the accessories you need to improve performance, convenience and everyday usability.
          </p>
        </PageHero>
        <Suspense fallback={null}>
          <AccessoriesCatalog products={products} />
        </Suspense>
        <HelpSection />
      </main>
      <SiteFooter />
    </div>
  );
}
