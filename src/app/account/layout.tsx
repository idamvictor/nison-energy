import type { Metadata } from "next";

import { SiteHeader } from "@/components/shared/site-header";
import { TrustBar } from "@/components/shared/trust-bar";
import { SiteFooter } from "@/components/shared/site-footer";
import { AccountNav } from "@/components/account/account-nav";
import { accountCustomer } from "@/lib/account-mock";

export const metadata: Metadata = {
  title: { template: "%s | My Account | Nison Energy", default: "My Account | Nison Energy" },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <TrustBar />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
          <p className="text-sm font-medium text-muted-foreground">
            Welcome back
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl">
            {accountCustomer.firstName} {accountCustomer.lastName}
          </h1>
          <div className="mt-6">
            <AccountNav />
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
