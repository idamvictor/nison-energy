import Link from "next/link";
import {
  ArrowRight,
  Cable,
  Inbox,
  MailWarning,
  Package,
  ShoppingBag,
  Zap,
} from "lucide-react";

import { StatCard } from "@/components/admin/dashboard/stat-card";
import { LeadTable } from "@/components/admin/shared/lead-table";
import { Button } from "@/components/ui/button";
import { products } from "@/lib/products";
import { commercialProducts } from "@/lib/commercial-products";
import { accessoryProducts } from "@/lib/accessory-products";
import { getLeads } from "@/lib/leads-dal";
import { getOrders, getPendingOrderCount } from "@/lib/orders-dal";

export default async function AdminDashboardPage() {
  const [leads, orders, pendingOrders] = await Promise.all([
    getLeads(),
    getOrders(),
    getPendingOrderCount(),
  ]);
  const newLeads = leads.filter((lead) => lead.status === "New").length;
  const recentLeads = leads.slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard
          label="Residential"
          value={products.length}
          subtext="Home chargers"
          icon={Zap}
          tone="primary"
          href="/admin/residential"
        />
        <StatCard
          label="Commercial"
          value={commercialProducts.length}
          subtext="Workplace chargers"
          icon={Package}
          tone="accent"
          href="/admin/commercial"
        />
        <StatCard
          label="Accessories"
          value={accessoryProducts.length}
          subtext="Cables"
          icon={Cable}
          tone="success"
          href="/admin/accessories"
        />
        <StatCard
          label="New leads"
          value={newLeads}
          subtext={`${leads.length} total`}
          icon={MailWarning}
          tone="accent"
          href="/admin/leads"
        />
        <StatCard
          label="Pending orders"
          value={pendingOrders}
          subtext={`${orders.length} total`}
          icon={ShoppingBag}
          tone="primary"
          href="/admin/orders"
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base font-semibold text-foreground">
            Recent leads
          </h2>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/admin/leads" />}
          >
            <Inbox />
            View all leads
            <ArrowRight />
          </Button>
        </div>
        <LeadTable leads={recentLeads} />
      </div>
    </div>
  );
}
