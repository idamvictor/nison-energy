import type { Metadata } from "next";

import { SiteHeader } from "@/components/shared/site-header";
import { TrustBar } from "@/components/shared/trust-bar";
import { ContactForm } from "@/components/contact/contact-form";
import { ContactInfo } from "@/components/contact/contact-info";
import { SiteFooter } from "@/components/shared/site-footer";
import { PageHero } from "@/components/shared/page-hero";

export const metadata: Metadata = {
  title: "Contact Us | Ocunio Energy",
  description:
    "We're here to help with chargers, installs, and grant eligibility. Get in touch and we'll take it from there.",
};

export default function ContactUsPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <TrustBar />
      <main className="flex-1">
        <PageHero
          align="left"
          eyebrow="Get in touch"
          title="Have a Question?"
          subtitle="We're here to help with chargers, installs, and grant eligibility."
        />

        <section className="bg-background">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_380px]">
              <ContactForm />
              <ContactInfo />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
