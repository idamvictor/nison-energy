import type { Metadata } from "next";
import { Suspense } from "react";

import { SiteHeader } from "@/components/shared/site-header";
import { TrustBar } from "@/components/shared/trust-bar";
import { SolarCatalog } from "@/components/solar/solar-catalog";
import { HelpSection } from "@/components/shared/help-section";
import { SiteFooter } from "@/components/shared/site-footer";
import { SolarHero } from "@/components/solar/solar-hero";
import { getSolarCatalog } from "@/lib/catalog/queries";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Plug-In Solar Panels | Ocunio Energy",
  description:
    "Plug-in solar panel kits with ground mounts — generate clean electricity in your garden or patio and plug straight into an outdoor socket. No roof installation needed.",
};

export default async function SolarPanelsPage() {
  const products = await getSolarCatalog();
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <TrustBar />
      <main className="flex-1">
        <SolarHero />
        <Suspense fallback={null}>
          <SolarCatalog products={products} />
        </Suspense>
        <HelpSection />
      </main>
      <SiteFooter />
    </div>
  );
}
