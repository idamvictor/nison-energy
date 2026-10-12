// Team roles and what each can do — the single source of truth for every
// admin check (server guards, API routes, sidebar, buttons). Safe to import
// from client components.
//
//   superadmin  everything, including the Price list (exactly one: the owner)
//   admin       everything except the Price list
//   staff       sees the admin; edits products, blog, leads, orders, quotes —
//               but not prices, quote deletion or the team
//   user        customers — no admin access

export const teamRoles = ["superadmin", "admin", "staff"] as const;
export type TeamRole = (typeof teamRoles)[number];
export type Role = TeamRole | "user";

/** Roles an invite / role change can grant (the Super admin is fixed). */
export const assignableRoles = ["admin", "staff"] as const satisfies readonly TeamRole[];
export type AssignableRole = (typeof assignableRoles)[number];

export type Permission =
  | "admin.access"
  | "prices.manage"
  | "products.edit"
  | "products.delete"
  | "products.pricing"
  | "blog.edit"
  | "leads.edit"
  | "orders.edit"
  | "quotes.review"
  | "quotes.delete"
  | "users.view"
  | "team.manage"
  | "alerts.staff"
  | "alerts.pricing";

const ALL: TeamRole[] = ["superadmin", "admin", "staff"];
const ADMINS: TeamRole[] = ["superadmin", "admin"];

const PERMISSIONS: Record<Permission, TeamRole[]> = {
  "admin.access": ALL,
  "prices.manage": ["superadmin"],
  "products.edit": ALL,
  "products.delete": ALL,
  "products.pricing": ADMINS,
  "blog.edit": ALL,
  "leads.edit": ALL,
  "orders.edit": ALL,
  "quotes.review": ALL,
  "quotes.delete": ADMINS,
  "users.view": ALL,
  "team.manage": ADMINS,
  "alerts.staff": ALL,
  "alerts.pricing": ["superadmin"],
};

export const roleLabels: Record<Role, string> = {
  superadmin: "Super admin",
  admin: "Admin",
  staff: "Staff",
  user: "Customer",
};

export function isTeamRole(role: string | null | undefined): role is TeamRole {
  return teamRoles.includes(role as TeamRole);
}

/** Does this role have this ability? Customers and unknown roles never do. */
export function can(role: string | null | undefined, permission: Permission): boolean {
  return isTeamRole(role) && PERMISSIONS[permission].includes(role);
}

/** Every role holding a permission (e.g. who receives an alert). */
export function rolesWith(permission: Permission): TeamRole[] {
  return [...PERMISSIONS[permission]];
}

const RANK: Record<Role, number> = { superadmin: 3, admin: 2, staff: 1, user: 0 };

/**
 * Can `actor` change/remove/ban someone currently holding `target`? Needs
 * team.manage, and the Super admin can never be managed by anyone else.
 */
export function canManageUser(actorRole: string | null | undefined, targetRole: string | null | undefined): boolean {
  if (!can(actorRole, "team.manage")) return false;
  const target = (isTeamRole(targetRole) ? targetRole : "user") as Role;
  if (target === "superadmin") return false;
  return RANK[actorRole as Role] >= RANK[target];
}

/** Normalise a stored role string (anything unknown = customer). */
export function toRole(role: string | null | undefined): Role {
  return isTeamRole(role) ? role : "user";
}
