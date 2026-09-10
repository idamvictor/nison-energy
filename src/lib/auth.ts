import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";

import { prisma } from "@/lib/db";

// Extra profile fields stored on the Better Auth `user` row. Kept in sync with
// the `User` model in prisma/schema.prisma and inferred on the client in
// src/lib/auth-client.ts.
export const userAdditionalFields = {
  phone: { type: "string", required: false },
  address: { type: "string", required: false },
  postcode: { type: "string", required: false },
} as const;

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  user: {
    additionalFields: userAdditionalFields,
  },
  emailAndPassword: {
    enabled: true,
    // No email provider yet — accounts are usable immediately. Add
    // `requireEmailVerification` + `sendResetPassword` when one is configured.
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
  plugins: [
    // New users get role "user" (customer). Staff are promoted to "admin" with
    // scripts/set-role.ts; `/admin` + the leads API check for it.
    admin({ adminRoles: ["admin"], defaultRole: "user" }),
    // Keep last — lets Better Auth set cookies from Server Actions.
    nextCookies(),
  ],
});
