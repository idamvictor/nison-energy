import type { Metadata } from "next";
import { Suspense } from "react";

import { SiteHeader } from "@/components/shared/site-header";
import { TrustBar } from "@/components/shared/trust-bar";
import { CircuitProtectorCatalog } from "@/components/circuit-protectors/circuit-protector-catalog";
import { HelpSection } from "@/components/shared/help-section";
import { SiteFooter } from "@/components/shared/site-footer";
import { PageHero } from "@/components/shared/page-hero";
import { getCircuitProtectorCatalog } from "@/lib/catalog/queries";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Circuit Protection | Ocunio Energy",
  description:
    "EV protection kits, RCBO units, heat pump and solar consumer units for safe, compliant EV charger, heat pump and solar installations.",
};

export default async function CircuitProtectorsPage() {
  const products = await getCircuitProtectorCatalog();
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <TrustBar />
      <main className="flex-1">
        <PageHero align="left" eyebrow="Trade Counter" title="Circuit Protection">
          <p className="mt-3 max-w-2xl text-lg font-semibold text-white">
            Genuine Matt:e and Whitecliffe for EV, heat pump and solar installs.
          </p>
          <p className="mt-2 max-w-2xl text-white/70">
            As an authorised Matt:e and Whitecliffe reseller, we supply genuine RCBOs, SPDs, PME fault detection, DC
            isolators and consumer units, backed by full warranty and fast UK delivery.
          </p>
        </PageHero>
        <Suspense fallback={null}>
          <CircuitProtectorCatalog products={products} />
        </Suspense>
        <HelpSection />
      </main>
      <SiteFooter />
    </div>
  );
}
