import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  ExternalLink,
  FileCheck2,
  PoundSterling,
  TrendingUp,
  Zap,
} from "lucide-react";

import { SiteHeader } from "@/components/shared/site-header";
import { TrustBar } from "@/components/shared/trust-bar";
import { SiteFooter } from "@/components/shared/site-footer";
import { HelpSection } from "@/components/shared/help-section";
import { Reveal } from "@/components/shared/reveal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const REGISTRATION_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfsSQ7zuj7YMe1rFBBI0qWf62ovcV4yXsU_HbXuvfrOfJ93Ww/viewform";

export const metadata: Metadata = {
  title: "Independent Subcontractor | Nison Energy",
  description:
    "Join Nison Energy's national network of EV installers — vetted leads, OZEV claim support, and no cost to join.",
};

const benefits = [
  {
    icon: Zap,
    title: "Residential & Commercial EV Projects",
  },
  {
    icon: FileCheck2,
    title: "OZEV Grant Support & Claim Assistance",
  },
  {
    icon: PoundSterling,
    title: "No Cost to Join",
  },
  {
    icon: CalendarClock,
    title: "Flexible Scheduling",
  },
  {
    icon: TrendingUp,
    title: "Grow Your Reputation Locally",
  },
];

export default function IndependentSubcontractorPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <TrustBar />
      <main className="flex-1">
        <div className="bg-primary text-primary-foreground">
          <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
            <p className="text-xs font-semibold tracking-widest text-primary-foreground/60 uppercase">
              Partner With Us
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
              Join Our National Network of EV Installers
            </h1>
            <p className="mt-3 text-primary-foreground/75">
              Are you an EV installer looking to grow your business, secure
              more jobs, and streamline your operations?
            </p>
            <Button
              size="lg"
              className="mt-8 h-12 gap-1.5 bg-accent px-6 text-base text-accent-foreground hover:bg-accent/90"
              nativeButton={false}
              render={<a href={REGISTRATION_URL} target="_blank" rel="noopener noreferrer" />}
            >
              Start the Registration
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>

        <section className="bg-background">
          <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
            <Reveal>
              <p className="text-base leading-relaxed text-foreground/80">
                We understand the unique challenges that come with running an
                EV installation business — from lead generation and customer
                conversion to managing OZEV claims and meeting tight
                installation deadlines. These hurdles can stretch even the
                most experienced electrical contractors. That&apos;s where we
                come in. By joining our trusted network of EV installers,
                you&apos;ll gain access to a steady stream of vetted leads
                across both residential and commercial sectors. We take care
                of the marketing and customer outreach — so you can focus on
                doing what you do best: delivering top-tier installations.
              </p>
            </Reveal>

            <Reveal>
              <h2 className="mt-12 mb-5 font-heading text-lg font-semibold text-foreground">
                Why Installers Partner With Nison Energy
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {benefits.map((benefit) => (
                  <Card key={benefit.title}>
                    <CardContent className="flex items-center gap-3.5">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <benefit.icon className="size-5" />
                      </span>
                      <p className="font-heading text-sm font-semibold text-foreground">
                        {benefit.title}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </Reveal>

            <Reveal>
              <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl border border-primary/15 bg-secondary px-6 py-10 text-center">
                <p className="font-heading text-lg font-semibold text-foreground">
                  Ready to get started?
                </p>
                <p className="max-w-md text-sm text-muted-foreground">
                  Click the link below to begin your registration on the
                  Google form.
                </p>
                <Button
                  size="lg"
                  className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90"
                  nativeButton={false}
                  render={<a href={REGISTRATION_URL} target="_blank" rel="noopener noreferrer" />}
                >
                  Start the Registration
                  <ExternalLink className="size-4" />
                </Button>
                <Link
                  href="/contact-us"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Prefer to talk it through first? Contact us
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        <HelpSection />
      </main>
      <SiteFooter />
    </div>
  );
}
