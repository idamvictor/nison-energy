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
                Our Story
              </h2>
              <div className="mt-5 flex flex-col gap-4 text-foreground/80">
                <p>
                  Ocunio Energy is the trading name of Nison Limited, an
                  OZEV-approved EV charger installation company built on a
                  simple observation: too many people invest thousands in an
                  electric vehicle, then undermine that investment on day
                  one.
                </p>
                <p>
                  We kept seeing the same pattern — someone buys a new EV,
                  then reaches for a cheap granny charger because it seems
                  like the easier option, without realising that slower
                  charging puts greater strain on their home wiring and can
                  cause long-term wear. Others simply don&apos;t know where
                  to start, which charger suits their home, whether they
                  qualify for a grant, or who to trust with the
                  installation. That confusion is holding people back from
                  embracing EVs with confidence.
                </p>
                <p>
                  This problem hasn&apos;t gone away. It&apos;s still what we
                  see today, and it&apos;s exactly what led us to start
                  Ocunio Energy — bringing the right charger, a proper
                  certified installation, and full grant support into one
                  straightforward service.
                </p>
                <p>
                  Today, based in Borehamwood, Hertfordshire, our certified
                  engineers help homeowners, landlords, schools, and
                  businesses across the UK make the switch properly: with a
                  charger that protects their investment, and an
                  installation done right the first time.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="flex h-full items-center rounded-2xl bg-primary p-8 text-primary-foreground sm:p-10">
              <p className="font-heading text-3xl leading-tight font-semibold tracking-[-0.01em] sm:text-4xl">
                &ldquo;One team, one point of contact, no surprises.&rdquo;
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
