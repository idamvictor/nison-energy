import Link from "next/link";
import {
  ArrowRight,
  Cable,
  Inbox,
  MailWarning,
  Package,
  ShoppingBag,
  Target,
  Zap,
} from "lucide-react";

import { StatCard } from "@/components/admin/dashboard/stat-card";
import { RangeTabs } from "@/components/admin/dashboard/range-tabs";
import { LeadsOrdersChart } from "@/components/admin/dashboard/leads-orders-chart";
import { FunnelBar } from "@/components/admin/dashboard/funnel-bar";
import { ActivityFeed } from "@/components/admin/dashboard/activity-feed";
import { LeadTable } from "@/components/admin/shared/lead-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getKpis,
  getLeadFunnel,
  getOrderPipeline,
  getRecentActivity,
  getRecentLeads,
  getTimeSeries,
} from "@/lib/admin/metrics";
import { getProductCounts } from "@/lib/catalog/queries";

const currency = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

const RANGE_DAYS: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90 };
const RANGE_LABEL: Record<string, string> = {
  "7d": "vs prev 7d",
  "30d": "vs prev 30d",
  "90d": "vs prev 90d",
};

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range = "30d" } = await searchParams;
  const days = RANGE_DAYS[range] ?? 30;
  const deltaLabel = RANGE_LABEL[range] ?? RANGE_LABEL["30d"];

  const [kpis, series, leadFunnel, orderPipeline, activity, recentLeads, productCounts] =
    await Promise.all([
      getKpis(days),
      getTimeSeries(days),
      getLeadFunnel(),
      getOrderPipeline(),
      getRecentActivity(),
      getRecentLeads(5),
      getProductCounts(),
    ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-heading text-base font-semibold text-foreground">
          Overview
        </h2>
        <RangeTabs />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="New leads"
          value={kpis.leads.value}
          delta={{ pct: kpis.leads.deltaPct, label: deltaLabel }}
          icon={MailWarning}
          tone="accent"
          href="/admin/leads"
        />
        <StatCard
          label="Orders"
          value={kpis.orders.value}
          delta={{ pct: kpis.orders.deltaPct, label: deltaLabel }}
          icon={ShoppingBag}
          tone="primary"
          href="/admin/orders"
        />
        <StatCard
          label="Pipeline value"
          value={currency.format(kpis.pipeline.value)}
          subtext="ex VAT · order subtotals"
          delta={{ pct: kpis.pipeline.deltaPct, label: deltaLabel }}
          icon={Package}
          tone="success"
        />
        <StatCard
          label="Lead conversion"
          value={`${kpis.conversion.value}%`}
          subtext="Won ÷ leads in period"
          delta={{ pct: kpis.conversion.deltaPct, label: deltaLabel }}
          icon={Target}
          tone="accent"
        />
      </div>

      <Card className="gap-3">
        <CardHeader>
          <CardTitle className="text-sm">Leads &amp; orders</CardTitle>
          <p className="text-xs text-muted-foreground">
            <span className="text-primary">Leads</span> and{" "}
            <span className="text-accent">orders</span> per day, last {days} days.
          </p>
        </CardHeader>
        <CardContent>
          <LeadsOrdersChart data={series} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <FunnelBar title="Lead funnel" data={leadFunnel} tone="primary" />
        <FunnelBar title="Order pipeline" data={orderPipeline} tone="accent" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
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
        <ActivityFeed items={activity} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Residential"
          value={productCounts.residential}
          subtext="Home chargers"
          icon={Zap}
          tone="primary"
          href="/admin/residential"
        />
        <StatCard
          label="Commercial"
          value={productCounts.commercial}
          subtext="Workplace chargers"
          icon={Package}
          tone="accent"
          href="/admin/commercial"
        />
        <StatCard
          label="Accessories"
          value={productCounts.accessory}
          subtext="Cables"
          icon={Cable}
          tone="success"
          href="/admin/accessories"
        />
      </div>
    </div>
  );
}
