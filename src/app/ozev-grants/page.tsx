import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  GraduationCap,
  Home,
  MapPin,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { SiteHeader } from "@/components/shared/site-header";
import { TrustBar } from "@/components/shared/trust-bar";
import { SiteFooter } from "@/components/shared/site-footer";
import { HelpSection } from "@/components/shared/help-section";
import { Reveal } from "@/components/shared/reveal";
import { SectionKicker } from "@/components/shared/section-kicker";
import { Button } from "@/components/ui/button";
import { GrantSchemeCard } from "@/components/grants/grant-scheme-card";
import { grantSchemes } from "@/lib/grants";

export const metadata: Metadata = {
  title: "OZEV Grants | Ocunio Energy",
  description:
    "Government grants can cover up to 75% of your EV charger installation. See which OZEV scheme you qualify for.",
};

const schemeIcons: Record<string, LucideIcon> = {
  "renters-and-flat-owners": Home,
  "residential-landlords": Building2,
  "workplace-charging-scheme": ShieldCheck,
  "education-institutions": GraduationCap,
  "on-street-parking": MapPin,
};

const stats = [
  { label: "Up to £500 per socket", sub: "Most residential & workplace schemes" },
  { label: "75% of costs covered", sub: "Purchase and installation, including VAT" },
  { label: "Up to £2,000 per socket", sub: "State-funded education institutions" },
];

export default function OzevGrantsPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <TrustBar />
      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="https://ocunioenergy.com/wp-content/uploads/2025/05/Home-Charging-Image.jpg"
              alt=""
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-primary via-primary/85 to-primary/70" />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 py-20 text-center text-primary-foreground sm:px-6 lg:px-8">
            <Reveal>
              <SectionKicker center tone="invert" />
              <h1 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.02em] sm:text-5xl">
                Are You Eligible For £500 Off?
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
                The government's OZEV grant schemes can cover up to 75% of
                your EV chargepoint costs — for homes, landlords, workplaces,
                schools and on-street parking. Most people qualify for at
                least one.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Button
                  size="lg"
                  className="h-11 gap-2 bg-accent px-5 text-accent-foreground hover:bg-accent/90"
                  nativeButton={false}
                  render={<Link href="/contact-us" />}
                >
                  <ShieldCheck className="size-4" />
                  Check my eligibility
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-11 border-white/25 bg-transparent px-5 text-primary-foreground hover:bg-white/10"
                  nativeButton={false}
                  render={<a href="tel:03306330252" />}
                >
                  <Phone className="size-4" />
                  033 0633 0252
                </Button>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-white/15 bg-white/10 px-4 py-5 backdrop-blur-sm"
                  >
                    <p className="font-heading text-xl font-semibold">
                      {stat.label}
                    </p>
                    <p className="mt-1 text-xs text-primary-foreground/70">
                      {stat.sub}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <section className="bg-background">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <Reveal>
              <div className="mx-auto max-w-2xl text-center">
                <SectionKicker center />
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">
                  Find the right scheme
                </h2>
                <p className="mt-3 text-muted-foreground">
                  Five OZEV grant schemes, each for a different situation.
                  Pick the one that matches yours to see the full eligibility
                  criteria and how to apply.
                </p>
              </div>
            </Reveal>

            <div className="mt-12 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {grantSchemes.map((scheme, index) => (
                <Reveal key={scheme.slug} delay={(index % 3) * 75}>
                  <GrantSchemeCard
                    scheme={scheme}
                    icon={schemeIcons[scheme.slug] ?? User}
                  />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <HelpSection />
      </main>
      <SiteFooter />
    </div>
  );
}
