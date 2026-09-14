import { Badge, type badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";
import type { PaymentStatus } from "@/lib/orders/types";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

const statusVariants: Record<PaymentStatus, BadgeVariant> = {
  Unpaid: "outline",
  Paid: "success",
  Failed: "destructive",
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge variant={statusVariants[status]}>{status}</Badge>;
}
