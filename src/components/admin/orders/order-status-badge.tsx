import { Badge, type badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";
import type { OrderStatus } from "@/lib/orders";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

const statusVariants: Record<OrderStatus, BadgeVariant> = {
  Pending: "default",
  Confirmed: "secondary",
  Scheduled: "outline",
  Installed: "success",
  Cancelled: "destructive",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant={statusVariants[status]}>{status}</Badge>;
}
