import { Badge } from "@/components/ui/badge";
import { isTeamRole, roleLabels } from "@/lib/auth/permissions";
import type { Role } from "@/lib/users/types";

export function RoleBadge({ role }: { role: Role }) {
  return (
    <Badge variant={isTeamRole(role) ? "default" : "secondary"}>{roleLabels[role]}</Badge>
  );
}
