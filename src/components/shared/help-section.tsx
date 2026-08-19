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
                  Our team is on hand to talk through chargers, installs, and
                  grant eligibility.
                </p>
              </div>

              <a
                href="tel:03306330252"
                className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/5 px-5 py-4 transition-colors hover:bg-white/10"
              >
                <Phone className="size-5" />
                <div>
                  <p className="text-xs text-primary-foreground/70">
                    Call our team
                  </p>
                  <p className="font-heading font-semibold">033 0633 0252</p>
                </div>
              </a>

              <Button
                size="lg"
                variant="outline"
                className="h-auto gap-3 border-white/20 bg-transparent px-5 py-4 text-primary-foreground hover:bg-white/10"
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
