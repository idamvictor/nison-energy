"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

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

export function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");
  const linkError = params.get("error");

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
    router.push("/sign-in?reset=1");
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Set a new password</CardTitle>
        <CardDescription>
          {invalid
            ? "This reset link is invalid or has expired."
            : "Choose a new password for your account."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {invalid ? (
          <Button
            nativeButton={false}
            render={<Link href="/forgot-password" />}
          >
            Request a new link
          </Button>
        ) : (
          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              New password
              <Input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Confirm password
              <Input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </label>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" size="lg" className="w-full" disabled={pending}>
              {pending ? "Saving…" : "Save new password"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
