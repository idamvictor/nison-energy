import type { Metadata } from "next";
import { Suspense } from "react";

import { SiteHeader } from "@/components/shared/site-header";
import { TrustBar } from "@/components/shared/trust-bar";
import { SolarCatalog } from "@/components/solar/solar-catalog";
import { HelpSection } from "@/components/shared/help-section";
import { SiteFooter } from "@/components/shared/site-footer";
import { PageHero } from "@/components/shared/page-hero";
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
        <PageHero
          align="left"
          eyebrow="Plug-in solar"
          title="Solar Panels"
          subtitle="Take control of your home energy bills and generate clean electricity on demand."
        >
          <p className="mt-3 max-w-2xl text-white/70">
            Our plug-and-play solar kits let you generate renewable power in your garden or patio without complex roof
            installations or invasive wiring. Set up the ground-mount stand in a sunny spot, plug into a dedicated
            outdoor socket, and start feeding self-generated solar energy into your home.
          </p>
        </PageHero>
        <Suspense fallback={null}>
          <SolarCatalog products={products} />
        </Suspense>
        <HelpSection />
      </main>
      <SiteFooter />
    </div>
  );
}
