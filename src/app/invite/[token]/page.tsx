import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { getCurrentUser } from "@/lib/auth/session";
import { getInviteState } from "@/lib/team/queries";
import { InviteAccept } from "./invite-accept";

export const metadata: Metadata = {
  title: "Team invite | Ocunio Energy",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const [state, user] = await Promise.all([getInviteState(token), getCurrentUser()]);

  return (
    <AuthShell>
      <InviteAccept
        token={token}
        state={state}
        signedInEmail={user?.email ?? null}
      />
    </AuthShell>
  );
}
