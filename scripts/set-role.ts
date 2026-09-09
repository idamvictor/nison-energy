/**
 * Promote / demote a Better Auth user by email.
 *
 *   npx tsx scripts/set-role.ts <email> [role]
 *
 * `role` defaults to "admin". Pass "user" to demote.
 * The email must already have signed in once (so the user row exists) and be on
 * STAFF_ALLOWLIST.
 */
import "dotenv/config";

import { prisma } from "../src/lib/db";

async function main() {
  const [email, role = "admin"] = process.argv.slice(2);

  if (!email) {
    console.error("Usage: npx tsx scripts/set-role.ts <email> [role]");
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
