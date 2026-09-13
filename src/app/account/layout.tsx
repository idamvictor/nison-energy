import type { Metadata } from "next";

import { SiteHeader } from "@/components/shared/site-header";
import { TrustBar } from "@/components/shared/trust-bar";
import { SiteFooter } from "@/components/shared/site-footer";
import { AccountNav } from "@/components/account/account-nav";
import { requireUser } from "@/lib/auth/session";
import { getUnreadCount } from "@/lib/notifications/queries";

export const metadata: Metadata = {
  title: { template: "%s | My Account | Ocunio Energy", default: "My Account | Ocunio Energy" },
};

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const unreadCount = await getUnreadCount(user.id);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <TrustBar />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
            <AccountNav unreadCount={unreadCount} />
            <div className="min-h-[80vh]">{children}</div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
