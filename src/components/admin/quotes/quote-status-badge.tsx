import { Badge, type badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";
import type { QuoteStatus } from "@/lib/quotes/types";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

const statusVariants: Record<QuoteStatus, BadgeVariant> = {
  Pending: "secondary",
  Approved: "success",
  Rejected: "destructive",
};

export function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  return <Badge variant={statusVariants[status]}>{status}</Badge>;
}
