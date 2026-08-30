import { Reveal } from "@/components/shared/reveal";
import { SectionKicker } from "@/components/shared/section-kicker";

export function WhyWeDoThis() {
  return (
    <section className="bg-secondary">
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <Reveal>
          <SectionKicker center />
          <h2 className="mt-4 text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl">
            Why We Do This
          </h2>
          <p className="mt-5 text-foreground/80">
            Buying an EV is a big decision, and it deserves a charging setup
            that matches it. We believe no one should have to choose between
            doing it properly and doing it cheaply out of confusion or
            convenience. We guide you through your OZEV grant application
            every step of the way, and as your OZEV-approved installer, we
            claim your grant on your behalf once installation is complete.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
