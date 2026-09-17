import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";

import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email/client";
import { passwordResetEmail } from "@/lib/email/templates";

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
  // Signed-cookie session cache: avoids a DB round trip on every request for
  // an existing session (getSession() reads the cookie instead). Off by
  // default for a stateful (DB-backed) config like this one. A revoked
  // admin role/ban takes up to maxAge to take effect for an already-signed-in
  // browser — a deliberate, bounded trade-off.
  session: {
    cookieCache: { enabled: true, maxAge: 60 },
  },
  user: {
    additionalFields: userAdditionalFields,
  },
  emailAndPassword: {
    enabled: true,
    // Password reset via Resend (src/lib/email). `url` points at
    // /api/auth/reset-password/<token>?callbackURL=/reset-password. Email
    // verification is intentionally not required (existing users would be
    // locked out). `sendEmail` never throws.
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        ...passwordResetEmail({ name: user.name, url }),
      });
    },
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
