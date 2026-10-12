/**
 * Promote / demote a Better Auth user by email.
 *
 *   npx tsx scripts/set-role.ts <email> [role]
 *
 * `role` is one of superadmin | admin | staff | user (default "admin");
 * "user" = customer. The email must already have signed in once (so the user
 * row exists). This is the bootstrap for the Super admin — after that, invite
 * and manage the team from /admin/users.
 */
import "dotenv/config";

import { prisma } from "../src/lib/db";

const ROLES = ["superadmin", "admin", "staff", "user"];

async function main() {
  const [email, role = "admin"] = process.argv.slice(2);

  if (!email || !ROLES.includes(role)) {
    console.error(`Usage: npx tsx scripts/set-role.ts <email> [${ROLES.join(" | ")}]`);
    process.exit(1);
  }

  const user = await prisma.user.update({
    where: { email },
    data: { role },
    select: { id: true, email: true, role: true },
  });

  console.log(`Updated ${user.email} -> role="${user.role}"`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
