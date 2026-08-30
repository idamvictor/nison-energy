import type { Metadata } from "next";

import { SiteHeader } from "@/components/shared/site-header";
import { TrustBar } from "@/components/shared/trust-bar";
import { AboutHero } from "@/components/about/about-hero";
import { OriginStory } from "@/components/about/origin-story";
import { WhyWeDoThis } from "@/components/about/why-we-do-this";
import { WhatWeDo } from "@/components/about/what-we-do";
import { WhatSetsUsApart } from "@/components/about/what-sets-us-apart";
import { LookingAhead } from "@/components/about/looking-ahead";
import { CompanyDetails } from "@/components/about/company-details";
import { AccreditationBadge } from "@/components/about/accreditation-badge";
import { HelpSection } from "@/components/shared/help-section";
import { SiteFooter } from "@/components/shared/site-footer";

export const metadata: Metadata = {
  title: "About Us | Ocunio Energy",
  description:
    "Your one-stop EV charging solution — buy, install, and claim your OZEV grant, all through Ocunio Energy.",
};

export default function AboutUsPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <TrustBar />
      <main className="flex-1">
        <AboutHero />
        <OriginStory />
        <WhyWeDoThis />
        <WhatWeDo />
        <WhatSetsUsApart />
        <LookingAhead />
        <CompanyDetails />
        <AccreditationBadge />
        <HelpSection />
      </main>
      <SiteFooter />
    </div>
  );
}
