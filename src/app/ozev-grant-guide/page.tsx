import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, Home, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { SiteHeader } from "@/components/shared/site-header";
import { TrustBar } from "@/components/shared/trust-bar";
import { SiteFooter } from "@/components/shared/site-footer";
import { Reveal } from "@/components/shared/reveal";
import { SectionKicker } from "@/components/shared/section-kicker";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "OZEV Grant Guide | Ocunio Energy",
  description:
    "Answer three quick questions and we'll walk you through applying for your OZEV grant — with nothing charged until it's approved.",
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

export default function OzevGrantGuideSelectorPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <TrustBar />
      <main className="flex-1">
        <div className="bg-primary text-primary-foreground">
          <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 lg:px-8">
            <SectionKicker center tone="invert" />
            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
              Which OZEV Grant Guide Do You Need?
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-primary-foreground/75">
              Tell us which situation matches you, and we&apos;ll walk you
              through eligibility, your quote, and the exact application
              steps — with nothing charged until OZEV approves.
            </p>
          </div>
        </div>

        <section className="bg-background">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {paths.map((path, index) => (
                <Reveal key={path.href} delay={index * 90}>
                  <Link href={path.href} className="group block h-full">
                    <Card className="h-full transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:ring-primary/20">
                      <CardContent className="flex h-full flex-col">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <path.icon className="size-5" />
                        </span>
                        <h2 className="mt-4 font-heading text-base font-semibold text-foreground">
                          {path.title}
                        </h2>
                        <p className="mt-1.5 text-sm text-muted-foreground">{path.copy}</p>
                        <span className="mt-auto flex items-center gap-1.5 pt-4 text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                          Start this guide
                          <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                        </span>
                      </CardContent>
                    </Card>
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
