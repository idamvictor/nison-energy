import { Badge } from "@/components/ui/badge";
import type { Role } from "@/lib/users/types";

export function RoleBadge({ role }: { role: Role }) {
  return (
    <Badge variant={role === "admin" ? "default" : "secondary"}>{role}</Badge>
  );
}
