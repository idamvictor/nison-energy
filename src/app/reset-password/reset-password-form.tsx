"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, LinkIcon, LockKeyhole } from "lucide-react";

import { authClient } from "@/lib/auth/client";
import { withRedirect } from "@/lib/auth/redirect";
import { Button } from "@/components/ui/button";
import {
  AuthHeading,
  FormAlert,
  PasswordField,
  SubmitButton,
} from "@/components/auth/auth-fields";

export function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");
  const linkError = params.get("error");
  const returnTo = params.get("redirect");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const invalid = !token || linkError;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (!token) return;
    setPending(true);
    const { error } = await authClient.resetPassword({
      newPassword: password,
      token,
    });
    if (error) {
      setError(error.message ?? "Could not reset the password. Request a new link.");
      setPending(false);
      return;
    }
    router.push(withRedirect("/sign-in?reset=1", returnTo));
  }

  if (invalid) {
    return (
      <div className="flex flex-col gap-8">
        <AuthHeading
          icon={<LinkIcon />}
          title="This reset link isn't valid"
          description="It may have expired or already been used. Reset links last one hour — request a new one and we'll email it over."
        />
        <Button
          size="lg"
          nativeButton={false}
          render={<Link href={withRedirect("/forgot-password", returnTo)} />}
          className="h-11 w-full rounded-xl bg-foreground text-sm font-semibold text-background hover:bg-foreground/85"
        >
          Request a new link
        </Button>
        <Link
          href={withRedirect("/sign-in", returnTo)}
          className="inline-flex items-center justify-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <AuthHeading
        icon={<LockKeyhole />}
        title="Set a new password"
        description="Choose a new password for your account. Use at least 8 characters."
      />
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <PasswordField
          label="New password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <PasswordField
          label="Confirm password"
          required
          minLength={8}
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        {error && <FormAlert tone="error">{error}</FormAlert>}
        <div className="pt-1">
          <SubmitButton pending={pending} pendingLabel="Saving…">
            Save new password
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
