"use client";

import { useState } from "react";
import Link from "next/link";

import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Reset your password</CardTitle>
        <CardDescription>
          {sent
            ? "Check your email."
            : "Enter your email and we'll send you a reset link."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {sent ? (
          <>
            <p className="text-sm text-muted-foreground">
              If an account exists for <span className="font-medium">{email}</span>,
              a password reset link is on its way. It expires in one hour.
            </p>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/sign-in" />}
            >
              Back to sign in
            </Button>
          </>
        ) : (
          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Email
              <Input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <Button type="submit" size="lg" className="w-full" disabled={pending}>
              {pending ? "Sending…" : "Send reset link"}
            </Button>
            <Link
              href="/sign-in"
              className="text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              Back to sign in
            </Link>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
