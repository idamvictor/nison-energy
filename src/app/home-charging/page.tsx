import type { Metadata } from "next";

import { SiteHeader } from "@/components/site-header";
import { TrustBar } from "@/components/trust-bar";
import { ProductGrid } from "@/components/product-grid";
import { HelpSection } from "@/components/help-section";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Home Charging | Nison Energy",
  description:
    "Browse our full range of OZEV-approved home EV chargers, professionally installed by certified engineers.",
};

export default function HomeChargingPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <TrustBar />
      <main className="flex-1">
        <div className="bg-secondary">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">
              Home charging
            </h1>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Our full range of OZEV-approved home chargers, professionally
              installed by certified engineers.
            </p>
          </div>
        </div>
        <ProductGrid
          title="All home chargers"
          subtitle="Every charger is professionally installed and backed by our certified engineer network."
        />
        <HelpSection />
      </main>
      <SiteFooter />
    </div>
  );
}
