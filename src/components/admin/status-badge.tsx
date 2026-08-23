import { Badge, type badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";
import type { LeadStatus } from "@/lib/admin-leads";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

const statusVariants: Record<LeadStatus, BadgeVariant> = {
  New: "default",
  Contacted: "secondary",
  Quoted: "outline",
  Won: "success",
  Lost: "destructive",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return <Badge variant={statusVariants[status]}>{status}</Badge>;
}
