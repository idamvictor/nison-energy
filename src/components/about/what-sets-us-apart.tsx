import { Check } from "lucide-react";

import { Reveal } from "@/components/shared/reveal";
import { SectionKicker } from "@/components/shared/section-kicker";

const points = [
  {
    title: "All-in-one service",
    copy: "Buy your charger, book your install, and get guided support through your grant, all through Ocunio Energy.",
  },
  {
    title: "OZEV-approved expertise",
    copy: "Accredited installers who know the grant schemes inside out, including residential, landlord, and Workplace Charging Scheme funding, and who claim your grant on your behalf once installation is complete.",
  },
  {
    title: "Certified installation",
    copy: "Every job carried out safely and correctly by qualified engineers, protecting your EV investment for the long term.",
  },
  {
    title: "Support at every step",
    copy: "From your free survey through to your grant application and aftercare, we're on hand to help.",
  },
];

export function WhatSetsUsApart() {
  return (
    <section className="relative isolate overflow-hidden bg-ink text-white">
      <div aria-hidden className="absolute -top-40 -left-32 -z-10 size-[520px] rounded-full bg-primary/20 blur-[120px]" />
      <div aria-hidden className="absolute -right-24 -bottom-48 -z-10 size-[420px] rounded-full bg-accent/15 blur-[120px]" />
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <SectionKicker />
          <h2 className="mt-4 text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">
            What Sets Us Apart
          </h2>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {points.map((point, index) => (
            <Reveal key={point.title} delay={index * 90}>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-[0_0_0_4px] shadow-accent/20">
                  <Check className="size-3.5" />
                </span>
                <div>
                  <p className="font-heading font-semibold">{point.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-white/70">
                    {point.copy}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
