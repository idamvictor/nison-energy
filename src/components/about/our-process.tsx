import { ClipboardCheck, FileCheck2, Send } from "lucide-react";

import { Reveal } from "@/components/shared/reveal";
import { SectionKicker } from "@/components/shared/section-kicker";

const steps = [
  {
    icon: ClipboardCheck,
    title: "Eligibility check",
    copy: "We review your details to confirm your eligibility and collect the required documentation.",
  },
  {
    icon: Send,
    title: "Application submission",
    copy: "Our team submits your grant application directly to OZEV on your behalf.",
  },
  {
    icon: FileCheck2,
    title: "Approval & installation",
    copy: "Once approved, we move forward with scheduling and completing your installation.",
  },
];

export function OurProcess() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <SectionKicker center />
            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl">
              How We Handle Your Grant Application
            </h2>
            <p className="mt-3 text-muted-foreground">
              We take care of the entire OZEV grant application process for
              you, start to finish.
            </p>
          </div>
        </Reveal>

        <div className="relative mt-14 grid grid-cols-1 gap-10 sm:grid-cols-3">
          {steps.map((step, index) => (
            <Reveal key={step.title} delay={index * 100}>
              <div className="relative flex flex-col items-start">
                <span className="font-heading text-sm font-semibold text-accent">
                  0{index + 1}
                </span>
                <div className="mt-3 flex size-14 items-center justify-center rounded-2xl bg-secondary">
                  <step.icon className="size-6 text-primary" />
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
