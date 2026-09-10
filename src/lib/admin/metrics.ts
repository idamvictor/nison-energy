import "server-only";

import { cache } from "react";

import { prisma } from "@/lib/db";
import { dbLeadToAdminLead } from "@/lib/leads/queries";
import { leadStatuses, type AdminLead, type LeadStatus } from "@/lib/leads/types";
import { orderStatuses, type OrderStatus } from "@/lib/orders/types";

const DAY_MS = 24 * 60 * 60 * 1000;

// ─── Date helpers (bucket in Europe/London, not UTC) ───────────────────────

const londonDay = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/London",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function londonDayKey(d: Date): string {
  return londonDay.format(d); // "YYYY-MM-DD"
}

/** The last `days` London-day keys, oldest first, for zero-filling a series. */
function dayRange(days: number): string[] {
  const keys: string[] = [];
  const now = Date.now();
  for (let i = days - 1; i >= 0; i--) {
    keys.push(londonDayKey(new Date(now - i * DAY_MS)));
  }
  return keys;
}

function deltaPct(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

type Metric = { value: number; previous: number; deltaPct: number };

function metric(value: number, previous: number): Metric {
  return { value, previous, deltaPct: deltaPct(value, previous) };
}

// ─── Time series ──────────────────────────────────────────────────────────

export type TimeSeriesPoint = {
  day: string; // "YYYY-MM-DD"
  leads: number;
  orders: number;
  value: number; // pipeline value (ex VAT, whole £)
};

export const getTimeSeries = cache(
  async (days: number): Promise<TimeSeriesPoint[]> => {
    const since = new Date(Date.now() - days * DAY_MS);
    const [leads, orders] = await Promise.all([
      prisma.lead.findMany({
        where: { submittedAt: { gte: since } },
        select: { submittedAt: true },
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: since } },
        select: { createdAt: true, subtotal: true },
      }),
    ]);

    const buckets = new Map<string, { leads: number; orders: number; value: number }>();
    const get = (key: string) => {
      let b = buckets.get(key);
      if (!b) {
        b = { leads: 0, orders: 0, value: 0 };
        buckets.set(key, b);
      }
      return b;
    };

    for (const lead of leads) get(londonDayKey(lead.submittedAt)).leads += 1;
    for (const order of orders) {
      const b = get(londonDayKey(order.createdAt));
      b.orders += 1;
      b.value += order.subtotal;
    }

    return dayRange(days).map((day) => ({
      day,
      leads: buckets.get(day)?.leads ?? 0,
      orders: buckets.get(day)?.orders ?? 0,
      value: buckets.get(day)?.value ?? 0,
    }));
  },
);

// ─── KPIs (current window vs immediately-preceding window) ─────────────────

export type Kpis = {
  leads: Metric;
  orders: Metric;
  pipeline: Metric; // whole £, ex VAT
  conversion: Metric; // percentage points (Won ÷ total leads in window), 0–100
};

export const getKpis = cache(async (days: number): Promise<Kpis> => {
  const now = Date.now();
  const since = new Date(now - days * DAY_MS);
  const prevSince = new Date(now - 2 * days * DAY_MS);

  const [
    leadsNow,
    leadsPrev,
    ordersNow,
    ordersPrev,
    valueNow,
    valuePrev,
    leadStatusNow,
    leadStatusPrev,
  ] = await Promise.all([
    prisma.lead.count({ where: { submittedAt: { gte: since } } }),
    prisma.lead.count({ where: { submittedAt: { gte: prevSince, lt: since } } }),
    prisma.order.count({ where: { createdAt: { gte: since } } }),
    prisma.order.count({ where: { createdAt: { gte: prevSince, lt: since } } }),
    prisma.order.aggregate({
      _sum: { subtotal: true },
      where: { createdAt: { gte: since } },
    }),
    prisma.order.aggregate({
      _sum: { subtotal: true },
      where: { createdAt: { gte: prevSince, lt: since } },
    }),
    prisma.lead.groupBy({
      by: ["status"],
      where: { submittedAt: { gte: since } },
      _count: { _all: true },
    }),
    prisma.lead.groupBy({
      by: ["status"],
      where: { submittedAt: { gte: prevSince, lt: since } },
      _count: { _all: true },
    }),
  ]);

  const wonRate = (
    rows: { status: LeadStatus; _count: { _all: number } }[],
  ): number => {
    const total = rows.reduce((n, r) => n + r._count._all, 0);
    if (total === 0) return 0;
    const won = rows.find((r) => r.status === "Won")?._count._all ?? 0;
    return Math.round((won / total) * 100);
  };

  return {
    leads: metric(leadsNow, leadsPrev),
    orders: metric(ordersNow, ordersPrev),
    pipeline: metric(valueNow._sum.subtotal ?? 0, valuePrev._sum.subtotal ?? 0),
    conversion: metric(wonRate(leadStatusNow), wonRate(leadStatusPrev)),
  };
});

// ─── Funnel / pipeline (current-status snapshot, all time) ─────────────────

export type StatusCount<T extends string> = { status: T; count: number };

export const getLeadFunnel = cache(async (): Promise<StatusCount<LeadStatus>[]> => {
  const rows = await prisma.lead.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const map = new Map(rows.map((r) => [r.status as LeadStatus, r._count._all]));
  return leadStatuses.map((status) => ({ status, count: map.get(status) ?? 0 }));
});

export const getOrderPipeline = cache(
  async (): Promise<StatusCount<OrderStatus>[]> => {
    const rows = await prisma.order.groupBy({
      by: ["status"],
      _count: { _all: true },
    });
    const map = new Map(rows.map((r) => [r.status as OrderStatus, r._count._all]));
    return orderStatuses.map((status) => ({ status, count: map.get(status) ?? 0 }));
  },
);

// ─── Recent leads (for the dashboard table) ───────────────────────────────

export const getRecentLeads = cache(async (limit = 5): Promise<AdminLead[]> => {
  const rows = await prisma.lead.findMany({
    orderBy: { submittedAt: "desc" },
    take: limit,
  });
  return rows.map(dbLeadToAdminLead);
});

// ─── Recent activity feed ─────────────────────────────────────────────────

export type ActivityItem =
  | {
      kind: "lead";
      id: string;
      title: string;
      status: LeadStatus;
      at: string; // ISO
      href: string;
    }
  | {
      kind: "order";
      id: string;
      title: string;
      status: OrderStatus;
      at: string;
      href: string;
      amount: number;
      reference: string;
    };

export const getRecentActivity = cache(
  async (limit = 8): Promise<ActivityItem[]> => {
    const [leads, orders] = await Promise.all([
      prisma.lead.findMany({
        orderBy: { submittedAt: "desc" },
        take: limit,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          status: true,
          submittedAt: true,
        },
      }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          reference: true,
          firstName: true,
          lastName: true,
          status: true,
          subtotal: true,
          createdAt: true,
        },
      }),
    ]);

    const items: ActivityItem[] = [
      ...leads.map(
        (l): ActivityItem => ({
          kind: "lead",
          id: l.id,
          title: `${l.firstName} ${l.lastName}`.trim(),
          status: l.status as LeadStatus,
          at: l.submittedAt.toISOString(),
          href: `/admin/leads/${l.id}`,
        }),
      ),
      ...orders.map(
        (o): ActivityItem => ({
          kind: "order",
          id: o.id,
          title: `${o.firstName} ${o.lastName}`.trim(),
          status: o.status as OrderStatus,
          at: o.createdAt.toISOString(),
          href: `/admin/orders/${o.id}`,
          amount: o.subtotal,
          reference: o.reference,
        }),
      ),
    ];

    return items
      .sort((a, b) => b.at.localeCompare(a.at))
      .slice(0, limit);
  },
);
