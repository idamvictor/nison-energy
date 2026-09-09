import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";

import { prisma } from "@/lib/db";

// Staff-only for now — both Google and email/password sign-up are gated to this
// allowlist. Opening sign-up to the public is a later phase (drop this hook,
// add email verification).
const staffAllowlist = (process.env.STAFF_ALLOWLIST ?? "")
  .split(",")
  .map((entry) => entry.trim().toLowerCase())
  .filter(Boolean);

function assertAllowlisted(email: string) {
  if (!staffAllowlist.includes(email.toLowerCase())) {
    throw new APIError("FORBIDDEN", {
      message: "This email is not authorised to create an account.",
    });
  }
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      // Always show the account chooser rather than silently reusing the last
      // Google session — matters on shared/staff machines.
      prompt: "select_account",
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          assertAllowlisted(user.email);
          return { data: user };
        },
      },
    },
  },
  plugins: [
    admin({ adminRoles: ["admin"], defaultRole: "user" }),
    // Keep last — lets Better Auth set cookies from Server Actions.
    nextCookies(),
  ],
});
