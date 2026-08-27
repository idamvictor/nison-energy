import type { Metadata } from "next";
import Link from "next/link";

import { SiteHeader } from "@/components/shared/site-header";
import { TrustBar } from "@/components/shared/trust-bar";
import { CategoryHero } from "@/components/shared/category-hero";
import { CommercialCatalog } from "@/components/workplace-charging/commercial-catalog";
import { Reveal } from "@/components/shared/reveal";
import { Button } from "@/components/ui/button";
import { HelpSection } from "@/components/shared/help-section";
import { SiteFooter } from "@/components/shared/site-footer";

export const metadata: Metadata = {
  title: "Commercial Chargers | Ocunio Energy",
  description:
    "Commercial EV charger installation for offices, depots and car parks, backed by the OZEV Workplace Charging Scheme.",
};

const IMG = "https://ocunioenergy.com/wp-content/uploads";

export default function WorkplaceChargingPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <TrustBar />
      <main className="flex-1">
        <CategoryHero
          title="Commercial Chargers"
          subtitle="Scalable commercial EV charger installations for offices, depots and car parks, backed by OZEV workplace funding."
          image={`${IMG}/2025/05/EV_OneStop_Website_Commercial_EV_Chargers_02.png`}
        />

        <CommercialCatalog />

        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
            <Reveal>
              <h2 className="text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
                Ready To Charge Your Fleet?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-primary-foreground/75">
                Tell us about your site and we&apos;ll come back with a free,
                no-obligation quote.
              </p>
              <Button
                size="lg"
                className="mt-8 h-12 bg-accent px-6 text-base text-accent-foreground hover:bg-accent/90"
                nativeButton={false}
                render={<Link href="/contact-us" />}
              >
                Talk to our team
              </Button>
            </Reveal>
          </div>
        </section>

        <HelpSection />
      </main>
      <SiteFooter />
    </div>
  );
}
