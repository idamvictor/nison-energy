import type { Metadata } from "next";

import { SiteHeader } from "@/components/shared/site-header";
import { TrustBar } from "@/components/shared/trust-bar";
import { AboutHero } from "@/components/about/about-hero";
import { OriginStory } from "@/components/about/origin-story";
import { WhatWeDo } from "@/components/about/what-we-do";
import { OurProcess } from "@/components/about/our-process";
import { OurTeam } from "@/components/about/our-team";
import { WhyChooseUs } from "@/components/about/why-choose-us";
import { CompanyDetails } from "@/components/about/company-details";
import { HelpSection } from "@/components/shared/help-section";
import { SiteFooter } from "@/components/shared/site-footer";

export const metadata: Metadata = {
  title: "About Us | Nison Energy",
  description:
    "A UK-based EV charger supplier and NICEIC-certified installation company, OZEV-accredited from the first question to the last cable.",
};

export default function AboutUsPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <TrustBar />
      <main className="flex-1">
        <AboutHero />
        <OriginStory />
        <WhatWeDo />
        <OurProcess />
        <OurTeam />
        <WhyChooseUs />
        <CompanyDetails />
        <HelpSection />
      </main>
      <SiteFooter />
    </div>
  );
}
