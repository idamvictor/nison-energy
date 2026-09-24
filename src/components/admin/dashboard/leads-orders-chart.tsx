"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { TimeSeriesPoint } from "@/lib/admin/metrics";
import { formatCurrency } from "@/lib/currency";

function shortDay(day: string) {
  return new Date(day).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

type TooltipEntry = { payload: TimeSeriesPoint };

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-foreground">{shortDay(point.day)}</p>
      <p className="mt-1 text-primary">{point.leads} leads</p>
      <p className="text-accent">{point.orders} orders</p>
      {point.value > 0 && (
        <p className="mt-1 text-muted-foreground">
          {formatCurrency(point.value)} pipeline
        </p>
      )}
    </div>
  );
}

export function LeadsOrdersChart({ data }: { data: TimeSeriesPoint[] }) {
  const tickGap = data.length > 45 ? 6 : data.length > 20 ? 3 : 0;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="day"
          tickFormatter={shortDay}
          interval={tickGap}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={{ stroke: "var(--border)" }}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
          width={32}
        />
        <Tooltip
          content={<ChartTooltip />}
          cursor={{ fill: "var(--muted)", opacity: 0.5 }}
        />
        <Bar dataKey="leads" fill="var(--primary)" radius={[3, 3, 0, 0]} maxBarSize={28} />
        <Bar dataKey="orders" fill="var(--accent)" radius={[3, 3, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}
