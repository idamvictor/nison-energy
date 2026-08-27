import type { Metadata } from "next";

import { SiteHeader } from "@/components/shared/site-header";
import { TrustBar } from "@/components/shared/trust-bar";
import { SiteFooter } from "@/components/shared/site-footer";
import { AccountNav } from "@/components/account/account-nav";

export const metadata: Metadata = {
  title: { template: "%s | My Account | Ocunio Energy", default: "My Account | Ocunio Energy" },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <TrustBar />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
            <AccountNav />
            <div className="min-h-[80vh]">{children}</div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
