import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge, type badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";
import type { OrderStatus, OrderWithItems } from "@/lib/orders/types";

const currency = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

const statusVariant: Record<OrderStatus, BadgeVariant> = {
  Pending: "default",
  Confirmed: "secondary",
  Scheduled: "outline",
  Installed: "success",
  Cancelled: "destructive",
};

const statusHint: Record<OrderStatus, string> = {
  Pending: "We've received your order and will be in touch to confirm.",
  Confirmed: "Confirmed — we're arranging your survey and installation.",
  Scheduled: "Your installation is booked in.",
  Installed: "Installed. Thanks for choosing Ocunio Energy.",
  Cancelled: "This order was cancelled.",
};

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function AccountOrders({ orders }: { orders: OrderWithItems[] }) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ShoppingBag className="size-5" />
        </span>
        <p className="font-heading text-lg font-semibold text-foreground">
          No orders yet
        </p>
        <p className="max-w-sm text-sm text-muted-foreground">
          When you place an order it&apos;ll show up here so you can track its
          progress.
        </p>
        <Button nativeButton={false} render={<Link href="/home-charging" />}>
          Browse chargers
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-[-0.02em] text-foreground">
          Orders
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Track the progress of your charger orders.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {orders.map((order) => {
          const status = order.status as OrderStatus;
          const itemCount = order.items.reduce((n, i) => n + i.quantity, 0);
          return (
            <Card key={order.id}>
              <CardContent className="flex flex-col gap-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-heading font-semibold text-foreground">
                      {order.reference}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Placed {formatDate(order.createdAt)} · {itemCount}{" "}
                      {itemCount === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <Badge variant={statusVariant[status]}>{status}</Badge>
                </div>

                <ul className="flex flex-col gap-1 text-sm text-foreground/80">
                  {order.items.map((item) => (
                    <li key={item.id}>
                      {item.quantity}× {item.name}
                    </li>
                  ))}
                </ul>

                <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
                  <p className="text-muted-foreground">{statusHint[status]}</p>
                  <p className="font-heading font-semibold text-foreground">
                    {currency.format(order.subtotal)}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
