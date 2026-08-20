import { Reveal } from "@/components/shared/reveal";
import { SectionKicker } from "@/components/shared/section-kicker";

export function OriginStory() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <div>
              <SectionKicker />
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl">
                Why We Started
              </h2>
              <div className="mt-5 flex flex-col gap-4 text-foreground/80">
                <p>
                  We noticed the EV charging market was full of unnecessary
                  complexity. Customers were left to navigate grant
                  applications and paperwork on their own, chasing separate
                  suppliers and installers just to get a single charger
                  fitted.
                </p>
                <p>
                  So we built Nison Energy to handle everything: site survey,
                  charger selection, DNO notification, OZEV grant
                  application, installation, commissioning and aftercare.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="flex h-full items-center rounded-2xl bg-primary p-8 text-primary-foreground sm:p-10">
              <p className="font-heading text-3xl leading-tight font-semibold tracking-[-0.01em] sm:text-4xl">
                &ldquo;One team, one point of contact.&rdquo;
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
