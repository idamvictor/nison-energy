import Image from "next/image";

import { Reveal } from "@/components/reveal";
import { SectionKicker } from "@/components/section-kicker";

const IMG = "https://ocunioenergy.com/wp-content/uploads/2025/05";

const steps = [
  {
    icon: `${IMG}/icons8-electric-vehicle-80.png`,
    title: "Choose your charger",
    copy: "Browse our range of OZEV-approved smart chargers, from 7kW home units to commercial multi-bay solutions. Not sure which is right for you? We'll help you decide.",
  },
  {
    icon: `${IMG}/icons8-survey-100-1.png`,
    title: "Home survey",
    copy: "Complete a short home survey and send us the required information — including proof of vehicle ownership if you're applying for an OZEV grant. We'll provide a detailed quote, free and with no obligation.",
  },
  {
    icon: `${IMG}/icons8-settings-100-1.png`,
    title: "Expert installation",
    copy: "We handle everything: DNO application, full electrical installation, commissioning, and OZEV grant submission. Most installs are completed in under three hours.",
  },
];

export function ThreeSteps() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <SectionKicker center />
          <h2 className="mt-4 text-center text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl">
            Three Simple Steps To Installing Your EV Charger
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8">
          {steps.map((step, index) => (
            <Reveal key={step.title} delay={index * 90}>
              <div className="flex flex-col items-start">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary">
                  <Image
                    src={step.icon}
                    alt=""
                    width={32}
                    height={32}
                    className="size-8 object-contain"
                  />
                </div>
                <p className="mt-5 font-heading text-lg font-semibold text-foreground">
                  {step.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.copy}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
