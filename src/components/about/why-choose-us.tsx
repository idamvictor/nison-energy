import Image from "next/image";
import { Check } from "lucide-react";

import { AnimatedNumber } from "@/components/shared/animated-number";
import { Reveal } from "@/components/shared/reveal";
import { SectionKicker } from "@/components/shared/section-kicker";

const IMG = "https://ocunioenergy.com/wp-content/uploads";

const differentiators = [
  "OZEV accredited — every installation qualifies for government grant support",
  "NICEIC certified — installed by qualified electricians",
  "End-to-end service — one team, one point of contact",
  "Transparent pricing, disclosed upfront with no hidden costs",
];

const accreditations = [
  { src: `${IMG}/2025/06/Picture3.png`, alt: "NAPIT", width: 110 },
  {
    src: `${IMG}/2025/06/Picture4.png`,
    alt: "Office for Low Emission Vehicles — Approved EV Charge Point Installer",
    width: 200,
  },
];

export function WhyChooseUs() {
  return (
    <section className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <SectionKicker tone="invert" />
          <h2 className="mt-4 text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">
            Why Choose Ocunio Energy
          </h2>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[auto_1fr] lg:items-center lg:gap-16">
          <Reveal>
            <div className="text-center lg:text-left">
              <p className="font-heading text-6xl font-semibold tracking-[-0.02em] sm:text-7xl">
                <AnimatedNumber value={90} suffix="%" />
              </p>
              <p className="mt-2 max-w-40 text-sm text-primary-foreground/70 lg:mx-0 mx-auto">
                of home installations completed in under three hours
              </p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <ul className="flex flex-col gap-4">
              {differentiators.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-white/15">
                    <Check className="size-3" />
                  </span>
                  <span className="text-primary-foreground/85">{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal delay={150}>
          <div className="mt-14 flex flex-wrap items-center justify-center gap-6 border-t border-white/15 pt-10 sm:justify-start">
            {accreditations.map((badge) => (
              <div
                key={badge.alt}
                className="flex h-14 items-center rounded-lg bg-white px-4"
              >
                <Image
                  src={badge.src}
                  alt={badge.alt}
                  width={badge.width}
                  height={40}
                  className="h-8 w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
