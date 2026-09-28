import type { Metadata } from "next";
import Image from "next/image";
import {
  Building2,
  GraduationCap,
  Home,
  MapPin,
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
import { GrantSchemeCard } from "@/components/grants/grant-scheme-card";
import { grantSchemes } from "@/lib/content/grant-schemes";

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
  {
    label: "Renters, Flat Owners & Landlord schemes",
    sub: "Covers 75% of cost up to £500 per socket. One socket per household & up to 200 sockets for landlords.",
  },
  {
    label: "Workplace Charging Scheme",
    sub: "Covers 75% of cost up to £500 per socket — up to 40 sockets",
  },
  {
    label: "WCS for State-Funded Schools",
    sub: "Covers 75% of cost up to £2,000 per socket — up to 40 sockets",
  },
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
            <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/85 to-ink/55" />
            <div aria-hidden className="absolute -top-32 left-1/2 size-[560px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 py-20 text-center text-white sm:px-6 lg:px-8">
            <Reveal>
              <SectionKicker center />
              <h1 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.02em] sm:text-5xl">
                Which OZEV Grant Could Save You Up to 75%?
              </h1>
              <p className="mx-auto mt-4 max-w-3xl text-white/75">
                You&apos;ll learn more about OZEV grant scheme — for renters,
                flat owners, residential landlords, workplaces, on-street
                parking households, and state-funded education settings.
                Whatever your situation, there&apos;s likely a grant to help
                cover your EV charger installation costs. As an OZEV-Approved
                Installer, Ocunio Energy matches you to the right scheme and
                manages the process from start to finish. Get in touch to find
                out which one applies to you.
              </p>
            </Reveal>

            <Reveal delay={100}>
              <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-4 text-left sm:grid-cols-3">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-white/15 bg-white/10 px-5 py-5 backdrop-blur-sm"
                  >
                    <p className="font-heading text-base font-semibold">
                      {stat.label}
                    </p>
                    <p className="mt-1.5 text-sm text-white/65">
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
                  Which OZEV grant is yours?
                </h2>
                <p className="mt-3 text-muted-foreground">
                  There are five OZEV chargepoint grants — one for almost
                  every situation. Find yours below to see exactly what you
                  qualify for and how to apply.
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
