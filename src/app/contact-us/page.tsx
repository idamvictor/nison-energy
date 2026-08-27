import type { Metadata } from "next";

import { SiteHeader } from "@/components/shared/site-header";
import { TrustBar } from "@/components/shared/trust-bar";
import { ContactForm } from "@/components/contact/contact-form";
import { ContactInfo } from "@/components/contact/contact-info";
import { SiteFooter } from "@/components/shared/site-footer";

export const metadata: Metadata = {
  title: "Contact Us | Ocunio Energy",
  description:
    "Ready to start your OZEV grant application? Get in touch and we'll take it from there.",
};

export default function ContactUsPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <TrustBar />
      <main className="flex-1">
        <div className="bg-primary text-primary-foreground">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
              Contact Us
            </h1>
            <p className="mt-3 max-w-lg text-primary-foreground/75">
              Ready to start your OZEV grant application? Tell us a bit
              about your enquiry and we&apos;ll take it from there.
            </p>
          </div>
        </div>

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
