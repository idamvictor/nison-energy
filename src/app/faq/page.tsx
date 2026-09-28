import type { Metadata } from "next";

import { SiteHeader } from "@/components/shared/site-header";
import { TrustBar } from "@/components/shared/trust-bar";
import { SiteFooter } from "@/components/shared/site-footer";
import { PageHero } from "@/components/shared/page-hero";
import { HelpSection } from "@/components/shared/help-section";
import { FaqSection } from "@/components/home/faq-section";
import { homeFaqCategories } from "@/lib/content/faqs";

export const metadata: Metadata = {
  title: "FAQ | Ocunio Energy",
  description:
    "Answers to common questions about ordering, delivery, installation, grants, returns, and warranty at Ocunio Energy.",
};

export default function FaqPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <TrustBar />
      <main className="flex-1">
        <PageHero
          eyebrow="Help centre"
          title="Frequently Asked Questions"
          subtitle="Everything you need to know about ordering, delivery, installation, grants, returns, and warranty support."
        />

        <FaqSection categories={homeFaqCategories} showHeading={false} />

        <HelpSection />
      </main>
      <SiteFooter />
    </div>
  );
}
