import { Building2, GraduationCap, Home } from "lucide-react";

import { Reveal } from "@/components/shared/reveal";
import { SectionKicker } from "@/components/shared/section-kicker";

const services = [
  {
    icon: Home,
    title: "Home Charging",
    copy: "Supply and installation of smart home chargers, with up to £500 in OZEV grant support for eligible customers.",
  },
  {
    icon: Building2,
    title: "Workplace Charging",
    copy: "From a couple of sockets to a full multi-bay commercial setup, with access to up to £20,000 in OZEV Workplace Charging Scheme grants.",
  },
  {
    icon: GraduationCap,
    title: "Schools & Public Sector",
    copy: "The same workplace grants apply to education and public sector sites — we have direct experience working with both.",
  },
];

export function WhatWeDo() {
  return (
    <section className="bg-secondary">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <SectionKicker center />
            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl">
              What We Do
            </h2>
          </div>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {services.map((service, index) => (
            <Reveal key={service.title} delay={index * 90}>
              <div className="flex flex-col items-start rounded-2xl bg-background p-6">
                <div className="flex size-12 items-center justify-center rounded-xl bg-secondary">
                  <service.icon className="size-6 text-primary" />
                </div>
                <p className="mt-5 font-heading text-lg font-semibold text-foreground">
                  {service.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {service.copy}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
