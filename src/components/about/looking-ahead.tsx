import { Reveal } from "@/components/shared/reveal";
import { SectionKicker } from "@/components/shared/section-kicker";

export function LookingAhead() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <Reveal>
          <SectionKicker center />
          <h2 className="mt-4 text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl">
            Looking Ahead
          </h2>
          <p className="mt-5 text-foreground/80">
            As more drivers make the move to electric, we&apos;re committed
            to making sure that transition is one people can make with
            confidence, not confusion — expanding our range of chargers,
            deepening our grant expertise, and continuing to help customers
            protect the investment they&apos;ve already made.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
