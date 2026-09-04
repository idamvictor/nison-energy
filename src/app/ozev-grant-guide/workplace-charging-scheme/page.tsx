import type { Metadata } from "next";

import { SiteHeader } from "@/components/shared/site-header";
import { TrustBar } from "@/components/shared/trust-bar";
import { SiteFooter } from "@/components/shared/site-footer";
import { getGrantScheme } from "@/lib/grants";

const scheme = getGrantScheme("workplace-charging-scheme")!;

export const metadata: Metadata = {
  title: `${scheme.title} | Ocunio Energy`,
};

export default function WorkplaceChargingSchemeGuidePage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <TrustBar />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">
            {scheme.title}
          </h1>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
