"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { authClient } from "@/lib/auth/client";
import { safeRedirect, withRedirect } from "@/lib/auth/redirect";
import { Button } from "@/components/ui/button";
import {
  AuthHeading,
  FormAlert,
  GoogleIcon,
  PasswordField,
  SubmitButton,
  TextField,
} from "@/components/auth/auth-fields";
import { cn } from "@/lib/utils";

type Mode = "sign-in" | "sign-up";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const redirectTo = safeRedirect(redirectParam);
  const justReset = searchParams.get("reset") === "1";

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
    <div className="flex flex-col gap-8">
      <AuthHeading
        title={isSignUp ? "Create your account" : "Welcome back"}
        description={
          isSignUp
            ? "Track your orders and OZEV grant application in one place."
            : "Sign in to track your orders, installation and grant."
        }
      />

      <div
        role="tablist"
        aria-label="Account"
        className="grid grid-cols-2 rounded-xl bg-muted p-1"
      >
        {(["sign-in", "sign-up"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => {
              setMode(m);
              setError(null);
            }}
            className={cn(
              "h-9 rounded-lg text-sm font-medium transition-all focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
              mode === m
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {m === "sign-in" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-5">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-11 w-full gap-2.5 rounded-xl bg-card text-sm font-medium shadow-xs"
          disabled={pending !== null}
          onClick={handleGoogleSignIn}
        >
          {pending === "google" ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Redirecting…
            </>
          ) : (
            <>
              <GoogleIcon />
              Continue with Google
            </>
          )}
        </Button>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or with email
          <span className="h-px flex-1 bg-border" />
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleEmailSubmit}>
          {isSignUp && (
            <TextField
              label="Name"
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          <TextField
            label="Email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <PasswordField
            label="Password"
            required
            minLength={8}
            autoComplete={isSignUp ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aside={
              !isSignUp && (
                <Link
                  href={withRedirect("/forgot-password", redirectParam)}
                  className="text-sm font-normal text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                >
                  Forgot password?
                </Link>
              )
            }
          />
          {isSignUp && (
            <p className="-mt-2 text-xs text-muted-foreground">At least 8 characters.</p>
          )}

          {justReset && !error && (
            <FormAlert tone="success">
              Password updated — sign in with your new password.
            </FormAlert>
          )}
          {error && <FormAlert tone="error">{error}</FormAlert>}

          <div className="pt-1">
            <SubmitButton
              pending={pending === "email"}
              pendingLabel={isSignUp ? "Creating account…" : "Signing in…"}
            >
              {isSignUp ? "Create account" : "Sign in"}
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
