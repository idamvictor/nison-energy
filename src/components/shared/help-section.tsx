import Link from "next/link";
import { Phone, PhoneCall } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/shared/reveal";

export function HelpSection() {
  return (
    <section className="bg-secondary">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-2xl bg-ink text-white">
            <div
              aria-hidden
              className="absolute -top-32 -left-24 -z-10 size-96 rounded-full bg-primary/25 blur-[110px]"
            />
            <div
              aria-hidden
              className="absolute -right-16 -bottom-40 -z-10 size-80 rounded-full bg-accent/20 blur-[110px]"
            />
            <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[1fr_auto_auto] lg:items-center lg:gap-6">
              <div>
                <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-accent uppercase">
                  <span className="size-1.5 rounded-full bg-accent" />
                  Talk to a specialist
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                  Get Help And Advice
                </h2>
                <p className="mt-2 text-white/70">
                  Our team is on hand to talk through our products, installs,
                  and grant eligibility.
                </p>
              </div>

              <Button
                size="lg"
                variant="cta"
                className="h-auto justify-start gap-3 px-5 py-3.5"
                nativeButton={false}
                render={<a href="tel:07525567054" />}
              >
                <Phone className="size-5" />
                <span className="flex flex-col items-start leading-tight">
                  <span className="text-xs font-normal text-accent-foreground/85">Call our team</span>
                  <span className="font-heading font-semibold">07525 567054</span>
                </span>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="h-auto gap-3 border-white/25 bg-transparent px-5 py-4 text-white hover:border-primary hover:bg-white/5 hover:text-primary"
                nativeButton={false}
                render={<Link href="/contact-us" />}
              >
                <PhoneCall className="size-5" />
                Request a callback
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
