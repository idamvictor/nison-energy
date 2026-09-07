import Link from "next/link";
import { Phone, PhoneCall } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/shared/reveal";

export function HelpSection() {
  return (
    <section className="bg-secondary">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <div className="overflow-hidden rounded-2xl bg-primary text-primary-foreground">
            <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[1fr_auto_auto] lg:items-center lg:gap-10">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Get Help And Advice
                </h2>
                <p className="mt-2 text-primary-foreground/75">
                  Our team is on hand to talk through our products, installs,
                  and grant eligibility.
                </p>
              </div>

              <a
                href="tel:07525567054"
                className="flex items-center gap-3 rounded-xl bg-accent px-5 py-4 text-accent-foreground transition-colors hover:bg-accent/90"
              >
                <Phone className="size-5" />
                <div>
                  <p className="text-xs text-accent-foreground/80">
                    Call our team
                  </p>
                  <p className="font-heading font-semibold">07525 567054</p>
                </div>
              </a>

              <Button
                size="lg"
                className="h-auto gap-3 bg-accent px-5 py-4 text-accent-foreground hover:bg-accent/90"
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
