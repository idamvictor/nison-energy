import type { Metadata } from "next";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/shared/admin-sidebar";
import { AdminTopbar } from "@/components/admin/shared/admin-topbar";
import { requireAdmin } from "@/lib/auth-dal";
import { getNewLeadCount } from "@/lib/leads-dal";
import { getPendingOrderCount } from "@/lib/orders-dal";

export const metadata: Metadata = {
  title: "Admin | Ocunio Energy",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Layouts don't re-render on client navigation, so this isn't the only gate —
  // proxy.ts covers navigations and the leads route handler guards the data.
  await requireAdmin();

  const [newLeadCount, pendingOrderCount] = await Promise.all([
    getNewLeadCount(),
    getPendingOrderCount(),
  ]);

  return (
    <SidebarProvider>
      <AdminSidebar
        newLeadCount={newLeadCount}
        pendingOrderCount={pendingOrderCount}
      />
      <SidebarInset>
        <AdminTopbar />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
