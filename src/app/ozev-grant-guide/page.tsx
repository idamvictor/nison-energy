import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Home,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { SiteHeader } from "@/components/shared/site-header";
import { TrustBar } from "@/components/shared/trust-bar";
import { SiteFooter } from "@/components/shared/site-footer";
import { PageHero } from "@/components/shared/page-hero";
import { Reveal } from "@/components/shared/reveal";

export const metadata: Metadata = {
  title: "OZEV Grant Guide | Ocunio Energy",
  description:
    "Select your OZEV grant and we'll walk you through eligibility, calculate your instant itemised quote, and guide you through the application — with nothing charged until OZEV approves.",
};

const paths: { title: string; copy: string; href: string; icon: LucideIcon }[] = [
  {
    title: "Renter or Flat Owner",
    copy: "Get up to £500 towards a chargepoint at the flat or rental home you live in.",
    href: "/ozev-grant-guide/renters-and-flat-owners",
    icon: Home,
  },
  {
    title: "Residential Landlord",
    copy: "Claim up to £500 per socket for chargepoints across your rental properties.",
    href: "/ozev-grant-guide/residential-landlords",
    icon: Building2,
  },
  {
    title: "Business, Charity or Public Sector",
    copy: "Save up to £20,000 installing chargepoints for staff or fleet under the Workplace Charging Scheme.",
    href: "/ozev-grant-guide/workplace-charging-scheme",
    icon: ShieldCheck,
  },
];

const steps: { title: string; copy: string }[] = [
  {
    title: "Choose your grant",
    copy: "Pick the scheme that fits your situation — for households, private landlords, or public and private sector organisations.",
  },
  {
    title: "Get your quote",
    copy: "Use our quote generator to create the compliant quote you'll need for your application — worth up to £500 per socket. Renting? You'll also need your landlord's permission.",
  },
  {
    title: "Apply & get approved",
    copy: "Submit your application on the government portal and, if approved, you'll receive an authorisation code for your grant.",
  },
];

export default function OzevGrantGuideSelectorPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <TrustBar />
      <main className="flex-1">
        <PageHero
          eyebrow="Applying for an OZEV grant"
          title="How it works"
          subtitle="Three simple steps from choosing your grant to getting your charger installed."
          size="compact"
        />

        <section className="bg-linear-to-b from-secondary/70 to-background">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
            <div className="relative">
              {/* Connector behind the step numbers (desktop only). */}
              <div
                aria-hidden
                className="absolute top-5.5 right-[16.66%] left-[16.66%] hidden h-0.5 bg-linear-to-r from-primary via-primary/60 to-accent md:block"
              />
              <ol className="relative grid grid-cols-1 gap-5 md:grid-cols-3">
                {steps.map((step, index) => (
                  <li key={step.title} className="flex">
                    <Reveal delay={index * 110} className="flex w-full flex-col items-center">
                      <span className="relative z-10 flex size-11 items-center justify-center rounded-2xl bg-ink font-heading text-lg font-semibold text-white shadow-lg ring-4 ring-background">
                        {index + 1}
                      </span>
                      <div className="mt-3 flex w-full flex-1 flex-col items-center rounded-2xl border border-foreground/15 bg-card px-6 pt-5 pb-5 text-center shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
                        <h2 className="font-heading text-lg font-semibold text-foreground">
                          {step.title}
                        </h2>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {step.copy}
                        </p>
                      </div>
                    </Reveal>
                  </li>
                ))}
              </ol>
            </div>

            <Reveal delay={200}>
              <div className="mt-6 flex w-full items-center gap-4 rounded-2xl border border-primary/30 bg-card px-5 py-4 shadow-md sm:px-6">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-success/12 text-success">
                  <BadgeCheck aria-hidden className="size-5.5" />
                </span>
                <p className="font-semibold text-foreground sm:text-base">
                  Once your grant has been approved, we&apos;ll send you a link to make
                  your purchase using your approved grant amount.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="bg-background">
          <div className="mx-auto max-w-6xl px-4 pt-2 pb-14 sm:px-6 lg:px-8">
            <h2 className="flex items-center justify-center gap-3 text-center text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl">
              <span aria-hidden className="h-0.5 w-8 rounded-full bg-accent" />
              Choose your grant
              <span aria-hidden className="h-0.5 w-8 rounded-full bg-accent" />
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
              {paths.map((path, index) => (
                <Reveal key={path.href} delay={index * 90} className="h-full">
                  <Link
                    href={path.href}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-foreground/15 bg-card shadow-md transition-all duration-200 hover:-translate-y-1 hover:border-primary/45 hover:shadow-xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                  >
                    <div className="relative isolate flex h-20 items-end overflow-hidden bg-ink px-6 pb-4">
                      <div
                        aria-hidden
                        className="absolute -top-14 -right-8 -z-10 size-40 rounded-full bg-primary/30 blur-3xl transition-opacity duration-300 group-hover:opacity-70"
                      />
                      <div
                        aria-hidden
                        className="absolute -bottom-20 -left-10 -z-10 size-36 rounded-full bg-accent/20 blur-3xl"
                      />
                      <span className="flex size-12 items-center justify-center rounded-xl bg-white/10 text-primary ring-1 ring-white/15 transition-transform duration-200 group-hover:scale-105">
                        <path.icon aria-hidden className="size-6" />
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col px-6 pt-5 pb-6">
                      <h3 className="font-heading text-lg font-semibold text-foreground">
                        {path.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                        {path.copy}
                      </p>
                      <span className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-4 text-sm font-semibold text-foreground">
                        Get a quote
                        <span className="flex size-8 items-center justify-center rounded-full bg-accent text-accent-foreground transition-transform duration-200 group-hover:translate-x-0.5">
                          <ArrowRight aria-hidden className="size-4" />
                        </span>
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
