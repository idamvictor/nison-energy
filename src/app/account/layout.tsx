import type { Metadata } from "next";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AccountSidebar } from "@/components/account/account-sidebar";
import { AccountTopbar } from "@/components/account/account-topbar";

export const metadata: Metadata = {
  title: { template: "%s | My Account | Nison Energy", default: "My Account | Nison Energy" },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AccountSidebar />
      <SidebarInset>
        <AccountTopbar />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
