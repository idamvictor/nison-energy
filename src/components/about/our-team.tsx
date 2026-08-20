import Image from "next/image";

import { Reveal } from "@/components/shared/reveal";
import { SectionKicker } from "@/components/shared/section-kicker";

const roles = [
  {
    title: "Site Surveyors",
    copy: "Assess your property, parking and power supply before any work begins, so your quote is accurate from the start.",
    image:
      "https://images.pexels.com/photos/37148308/pexels-photo-37148308.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    title: "NICEIC-Certified Electricians",
    copy: "Carry out every installation to full electrical safety standards, then test and commission your charger on the day.",
    image:
      "https://images.pexels.com/photos/9092311/pexels-photo-9092311.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    title: "Grant Applications Team",
    copy: "Handles your OZEV paperwork from eligibility check through to submission, so you don't have to.",
    image:
      "https://images.pexels.com/photos/29852852/pexels-photo-29852852.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    title: "Customer Support",
    copy: "On hand by phone for any question — before, during or after your installation.",
    image:
      "https://images.pexels.com/photos/31869537/pexels-photo-31869537.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
];

export function OurTeam() {
  return (
    <section className="bg-secondary">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <SectionKicker center />
            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl">
              The People Behind Every Installation
            </h2>
            <p className="mt-3 text-muted-foreground">
              One team, working together from your first enquiry to the
              moment you plug in.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {roles.map((role, index) => (
            <Reveal key={role.title} delay={index * 80}>
              <div className="overflow-hidden rounded-2xl bg-background">
                <div className="relative aspect-square w-full">
                  <Image
                    src={role.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-5">
                  <p className="font-heading text-base font-semibold text-foreground">
                    {role.title}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {role.copy}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
