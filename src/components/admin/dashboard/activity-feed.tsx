import Link from "next/link";
import { Inbox, ShoppingBag } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { OrderStatusBadge } from "@/components/admin/orders/order-status-badge";
import type { ActivityItem } from "@/lib/admin/metrics";
import { formatCurrency } from "@/lib/currency";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <Card className="gap-3">
      <CardHeader>
        <CardTitle className="text-sm">Recent activity</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col">
        {items.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nothing yet.
          </p>
        ) : (
          items.map((item) => (
            <Link
              key={`${item.kind}-${item.id}`}
              href={item.href}
              className="-mx-2 flex items-start gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/60"
            >
              <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                {item.kind === "lead" ? (
                  <Inbox className="size-3.5" />
                ) : (
                  <ShoppingBag className="size-3.5" />
                )}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-foreground">
                    {item.title}
                  </p>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {timeAgo(item.at)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {item.kind === "lead" ? (
                    <>
                      <span>New enquiry</span>
                      <StatusBadge status={item.status} />
                    </>
                  ) : (
                    <>
                      <span>
                        {item.reference} · {formatCurrency(item.amount)}
                      </span>
                      <OrderStatusBadge status={item.status} />
                    </>
                  )}
                </div>
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
