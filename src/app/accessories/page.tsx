import type { Metadata } from "next";

import { SiteHeader } from "@/components/shared/site-header";
import { TrustBar } from "@/components/shared/trust-bar";
import { AccessoriesCatalog } from "@/components/accessories/accessories-catalog";
import { HelpSection } from "@/components/shared/help-section";
import { SiteFooter } from "@/components/shared/site-footer";

export const metadata: Metadata = {
  title: "Accessories | Nison Energy",
  description:
    "Type 2 EV charging cables in coiled or straight styles, discreet grey or hi-vis lime green, for single-phase and three-phase charging.",
};

export default function AccessoriesPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <TrustBar />
      <main className="flex-1">
        <div className="bg-primary text-primary-foreground">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
              Accessories
            </h1>
            <p className="mt-3 max-w-lg text-primary-foreground/75">
              TÜV-certified Type 2 charging cables — coiled or straight,
              discreet grey or hi-vis lime green, single-phase or three-phase.
            </p>
          </div>
        </div>
        <AccessoriesCatalog />
        <HelpSection />
      </main>
      <SiteFooter />
    </div>
  );
}
