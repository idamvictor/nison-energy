"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, KeyRound, MailCheck } from "lucide-react";

import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { AuthHeading, SubmitButton, TextField } from "@/components/auth/auth-fields";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    // Ignore the result — we always show the same message so an attacker can't
    // probe which emails have accounts.
    await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });
    setPending(false);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-8">
        <AuthHeading
          icon={<MailCheck />}
          title="Check your email"
          description={
            <>
              If an account exists for{" "}
              <span className="font-medium text-foreground">{email}</span>, a password
              reset link is on its way. It expires in one hour.
            </>
          }
        />
        <Button
          variant="outline"
          size="lg"
          nativeButton={false}
          render={<Link href="/sign-in" />}
          className="h-11 w-full gap-2 rounded-xl bg-card text-sm font-medium shadow-xs"
        >
          <ArrowLeft className="size-4" />
          Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <AuthHeading
        icon={<KeyRound />}
        title="Reset your password"
        description="Enter the email you signed up with and we'll send you a reset link."
      />
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <TextField
          label="Email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="pt-1">
          <SubmitButton pending={pending} pendingLabel="Sending link…">
            Send reset link
          </SubmitButton>
        </div>
      </form>
      <Link
        href="/sign-in"
        className="inline-flex items-center justify-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to sign in
      </Link>
    </div>
  );
}
