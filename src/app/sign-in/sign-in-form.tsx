"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function safeRedirect(target: string | null): string {
  // Only allow same-origin relative paths.
  if (target && target.startsWith("/") && !target.startsWith("//")) {
    return target;
  }
  return "/admin";
}

type Mode = "sign-in" | "sign-up";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = safeRedirect(searchParams.get("redirect"));

  const [mode, setMode] = useState<Mode>("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<"email" | "google" | null>(null);

  async function handleEmailSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending("email");

    const { error } =
      mode === "sign-up"
        ? await authClient.signUp.email({ name, email, password })
        : await authClient.signIn.email({ email, password });

    if (error) {
      setError(
        error.message ??
          (mode === "sign-up"
            ? "Could not create the account."
            : "Could not sign in. Check your details."),
      );
      setPending(null);
      return;
    }
    router.push(redirectTo);
    router.refresh();
  }

  async function handleGoogleSignIn() {
    setError(null);
    setPending("google");
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: redirectTo,
    });
    if (error) {
      setError(error.message ?? "Could not start Google sign-in.");
      setPending(null);
    }
  }

  const isSignUp = mode === "sign-up";

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>
          {isSignUp ? "Create a staff account" : "Sign in to Ocunio Energy"}
        </CardTitle>
        <CardDescription>
          Staff access only — your email must be on the allowlist.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full"
          disabled={pending !== null}
          onClick={handleGoogleSignIn}
        >
          {pending === "google" ? "Redirecting…" : "Continue with Google"}
        </Button>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>

        <form className="flex flex-col gap-3" onSubmit={handleEmailSubmit}>
          {isSignUp && (
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Name
              <Input
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
          )}
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
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Password
            <Input
              type="password"
              required
              minLength={8}
              autoComplete={isSignUp ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={pending !== null}
          >
            {pending === "email"
              ? isSignUp
                ? "Creating…"
                : "Signing in…"
              : isSignUp
                ? "Create account"
                : "Sign in"}
          </Button>
        </form>

        <button
          type="button"
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          onClick={() => {
            setMode(isSignUp ? "sign-in" : "sign-up");
            setError(null);
          }}
        >
          {isSignUp
            ? "Already have an account? Sign in"
            : "First time here? Create an account"}
        </button>
      </CardContent>
    </Card>
  );
}
