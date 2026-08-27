import type { Metadata } from "next";

import { SiteHeader } from "@/components/shared/site-header";
import { TrustBar } from "@/components/shared/trust-bar";
import { CategoryHero } from "@/components/shared/category-hero";
import { HomeChargingCatalog } from "@/components/home-charging/home-charging-catalog";
import { HelpSection } from "@/components/shared/help-section";
import { SiteFooter } from "@/components/shared/site-footer";

export const metadata: Metadata = {
  title: "Residential Chargers | Ocunio Energy",
  description:
    "Browse our full range of OZEV-approved home EV chargers, professionally installed by certified engineers.",
};

const IMG = "https://ocunioenergy.com/wp-content/uploads";

export default function HomeChargingPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <TrustBar />
      <main className="flex-1">
        <CategoryHero
          title="Residential Chargers"
          subtitle="Our full range of OZEV-approved home chargers, professionally installed by certified engineers."
          image={`${IMG}/2025/05/EV_OneStop_Website_Home_Chargers.png`}
        />
        <HomeChargingCatalog />
        <HelpSection />
      </main>
      <SiteFooter />
    </div>
  );
}
