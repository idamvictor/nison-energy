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
                  We help homeowners, businesses, schools and landlords get
                  the right charger installed correctly — with as little
                  fuss as possible. We&apos;re OZEV-accredited, which means
                  every installation we carry out is eligible for government
                  grant support, and we handle the application process for
                  you.
                </p>
                <p>
                  We started Ocunio Energy because we noticed the EV charging
                  market was full of unnecessary complexity. Too many
                  customers were left to navigate grant applications, DNO
                  paperwork and installation logistics on their own — often
                  with little support after the sale.
                </p>
                <p>
                  We do things differently. From your first enquiry to the
                  moment you plug in for the first time, we manage
                  everything: site survey, charger selection, DNO
                  notification, OZEV grant application, installation,
                  commissioning and aftercare.
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
