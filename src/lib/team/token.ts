import "server-only";

import { createHash, randomBytes } from "node:crypto";

/** A fresh invite token (goes in the email link only) and its stored hash. */
export function newInviteToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashInviteToken(token) };
}

export function hashInviteToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
