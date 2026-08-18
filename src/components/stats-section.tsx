import { AnimatedNumber } from "@/components/animated-number";
import { Reveal } from "@/components/reveal";
import { SectionKicker } from "@/components/section-kicker";

const stats = [
  { value: 500, prefix: "£", label: "OZEV grant available per home charger" },
  { value: 3, suffix: "hrs", label: "Average installation time" },
  { value: 90, suffix: "%", label: "Installations completed as standard" },
];

export function StatsSection() {
  return (
    <section className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <SectionKicker center tone="invert" />
          <h2 className="mt-4 text-center text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">
            At A Glance
          </h2>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-3">
          {stats.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 90}>
              <div className="text-center">
                <p className="font-heading text-4xl font-semibold tracking-[-0.02em] sm:text-5xl">
                  <AnimatedNumber
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                  />
                </p>
                <p className="mt-2 text-sm text-primary-foreground/70">
                  {stat.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
