"use client";

import { createAuthClient } from "better-auth/react";
import { adminClient, inferAdditionalFields } from "better-auth/client/plugins";

// Field shapes kept in sync with `userAdditionalFields` in src/lib/auth.ts
// (declared inline rather than `inferAdditionalFields<typeof auth>()` to avoid
// pulling server-only modules into the client bundle).
export const authClient = createAuthClient({
  plugins: [
    adminClient(),
    inferAdditionalFields({
      user: {
        phone: { type: "string", required: false },
        address: { type: "string", required: false },
        postcode: { type: "string", required: false },
      },
    }),
  ],
});

export const { signIn, signOut, signUp, useSession } = authClient;
