"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AuthHeading,
  FormAlert,
  PasswordField,
  SubmitButton,
  TextField,
} from "@/components/auth/auth-fields";
import { authClient } from "@/lib/auth/client";
import { roleLabels } from "@/lib/auth/permissions";
import { withRedirect } from "@/lib/auth/redirect";
import { acceptTeamInvite, createInvitedAccount } from "@/lib/team/actions";
import type { InviteState } from "@/lib/team/types";

export function InviteAccept({
  token,
  state,
  signedInEmail,
}: {
  token: string;
  state: InviteState;
  signedInEmail: string | null;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (state.status === "invalid") {
    return (
      <div className="flex flex-col gap-6">
        <AuthHeading
          title="This invite is no longer valid"
          description="It may have expired, been used already or been replaced by a newer invite. Ask an admin to send you a new one."
        />
        <Button render={<Link href="/" />} nativeButton={false} variant="outline" className="h-11 rounded-xl">
          Go to the homepage
        </Button>
      </div>
    );
  }

  const roleLabel = roleLabels[state.role];
  const description = (
    <>
      {state.invitedByName ? `${state.invitedByName} has invited you` : "You've been invited"} to join the
      Ocunio Energy admin as <strong className="text-foreground">{roleLabel}</strong>.
    </>
  );
  const here = `/invite/${token}`;

  function finish(result: { ok: true } | { ok: false; error: string }) {
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  // Signed in as someone else.
  if (signedInEmail && signedInEmail.toLowerCase() !== state.email.toLowerCase()) {
    return (
      <div className="flex flex-col gap-6">
        <AuthHeading title="Join the team" description={description} icon={<ShieldCheck />} />
        <FormAlert tone="error">
          You&rsquo;re signed in as {signedInEmail}, but this invite is for {state.email}. Sign out,
          then open the invite link again.
        </FormAlert>
        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-xl"
          onClick={async () => {
            await authClient.signOut();
            window.location.reload();
          }}
        >
          Sign out
        </Button>
      </div>
    );
  }

  // Signed in with the invited email.
  if (signedInEmail) {
    return (
      <div className="flex flex-col gap-6">
        <AuthHeading title="Join the team" description={description} icon={<ShieldCheck />} />
        {error && <FormAlert tone="error">{error}</FormAlert>}
        <Button
          type="button"
          size="lg"
          className="h-11 rounded-xl"
          disabled={pending}
          onClick={() => {
            setError(null);
            startTransition(async () => finish(await acceptTeamInvite(token)));
          }}
        >
          {pending ? "Accepting…" : "Accept invite"}
        </Button>
      </div>
    );
  }

  // Has an account — sign in first, then come back here.
  if (state.hasAccount) {
    return (
      <div className="flex flex-col gap-6">
        <AuthHeading title="Join the team" description={description} icon={<ShieldCheck />} />
        <p className="text-sm text-muted-foreground">
          You already have an account with {state.email}. Sign in with it to accept the invite.
        </p>
        <Button render={<Link href={withRedirect("/sign-in", here)} />} nativeButton={false} size="lg" className="h-11 rounded-xl">
          Sign in to accept
        </Button>
      </div>
    );
  }

  // New to the site — create the account for the invited email.
  return (
    <div className="flex flex-col gap-6">
      <AuthHeading title="Join the team" description={description} icon={<ShieldCheck />} />
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          startTransition(async () => finish(await createInvitedAccount({ token, name, password })));
        }}
      >
        <TextField label="Email" type="email" value={state.email} readOnly disabled />
        <TextField
          label="Name"
          type="text"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <PasswordField
          label="Password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <p className="-mt-2 text-xs text-muted-foreground">At least 8 characters.</p>
        {error && <FormAlert tone="error">{error}</FormAlert>}
        <div className="pt-1">
          <SubmitButton pending={pending} pendingLabel="Creating account…">
            Create account &amp; join
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
