import Link from "next/link";
import { ArrowRight, Cable, Inbox, MailWarning, Package, Zap } from "lucide-react";

import { StatCard } from "@/components/admin/dashboard/stat-card";
import { LeadTable } from "@/components/admin/shared/lead-table";
import { Button } from "@/components/ui/button";
import { products } from "@/lib/products";
import { commercialProducts } from "@/lib/commercial-products";
import { accessoryProducts } from "@/lib/accessory-products";
import { adminLeads } from "@/lib/admin-leads";

export default function AdminDashboardPage() {
  const totalProducts =
    products.length + commercialProducts.length + accessoryProducts.length;
  const newLeads = adminLeads.filter((lead) => lead.status === "New").length;
  const recentLeads = [...adminLeads]
    .sort(
      (a, b) =>
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    )
    .slice(0, 5);

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
          label="Total products"
          value={totalProducts}
          subtext="Across 3 categories"
          icon={Package}
          tone="muted"
        />
        <StatCard
          label="New leads"
          value={newLeads}
          subtext={`${adminLeads.length} total`}
          icon={MailWarning}
          tone="accent"
          href="/admin/leads"
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base font-semibold text-foreground">
            Recent leads
          </h2>
          <Button variant="outline" size="sm" render={<Link href="/admin/leads" />}>
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
