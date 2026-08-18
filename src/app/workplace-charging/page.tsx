import type { Metadata } from "next";
import { Banknote, Building2, ClipboardCheck } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { TrustBar } from "@/components/trust-bar";
import { CategoryHero } from "@/components/category-hero";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { HelpSection } from "@/components/help-section";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Workplace Charging | Nison Energy",
  description:
    "Commercial EV charger installation for offices, depots and car parks, backed by the OZEV Workplace Charging Scheme.",
};

const IMG = "https://ocunioenergy.com/wp-content/uploads";

const benefits = [
  {
    icon: Banknote,
    title: "Up to £20,000 in grants",
    copy: "The OZEV Workplace Charging Scheme covers up to £500 per socket, for up to 40 sockets. We handle the application for you.",
  },
  {
    icon: Building2,
    title: "Any site size",
    copy: "From a two-socket car park to a multi-bay commercial hub, we design a solution that fits your site and budget.",
  },
  {
    icon: ClipboardCheck,
    title: "Free site assessment",
    copy: "Our engineers carry out a free assessment of your site's power supply and layout before any work begins.",
  },
];

export default function WorkplaceChargingPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <TrustBar />
      <main className="flex-1">
        <CategoryHero
          title="Workplace Charging"
          subtitle="Scalable commercial EV charger installations for offices, depots and car parks, backed by OZEV workplace funding."
          image={`${IMG}/2025/05/EV_OneStop_Website_Commercial_EV_Chargers_02.png`}
        />

        <section className="bg-background">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8">
              {benefits.map((benefit, index) => (
                <Reveal key={benefit.title} delay={index * 90}>
                  <div className="flex flex-col items-start">
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary">
                      <benefit.icon className="size-6 text-primary" />
                    </div>
                    <p className="mt-5 font-heading text-lg font-semibold text-foreground">
                      {benefit.title}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {benefit.copy}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

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
              >
                Get a workplace quote
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
