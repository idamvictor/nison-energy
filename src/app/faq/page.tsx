import type { Metadata } from "next";

import { SiteHeader } from "@/components/shared/site-header";
import { TrustBar } from "@/components/shared/trust-bar";
import { SiteFooter } from "@/components/shared/site-footer";
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
        <div className="bg-primary text-primary-foreground">
          <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 lg:px-8">
            <h1 className="text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
              Frequently Asked Questions
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-primary-foreground/75">
              Everything you need to know about ordering, delivery,
              installation, grants, returns, and warranty support.
            </p>
          </div>
        </div>

        <FaqSection categories={homeFaqCategories} showHeading={false} />

        <HelpSection />
      </main>
      <SiteFooter />
    </div>
  );
}
