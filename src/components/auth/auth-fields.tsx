"use client";

import { useState } from "react";
import { CircleAlert, CircleCheck, Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const authInputClass = "h-11 rounded-xl bg-card px-3.5 shadow-xs";

export function AuthHeading({
  title,
  description,
  icon,
}: {
  title: string;
  description: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      {icon && (
        <span className="mb-3 flex size-12 items-center justify-center rounded-2xl border border-border bg-card text-foreground shadow-xs [&_svg]:size-5">
          {icon}
        </span>
      )}
      <h1 className="text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl">
        {title}
      </h1>
      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

export function Field({
  label,
  aside,
  children,
}: {
  label: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {aside}
      </div>
      {children}
    </div>
  );
}

export function TextField({
  label,
  aside,
  ...props
}: { label: string; aside?: React.ReactNode } & React.ComponentProps<"input">) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-center justify-between gap-2 text-sm font-medium text-foreground">
        {label}
        {aside}
      </span>
      <Input {...props} className={cn(authInputClass, props.className)} />
    </label>
  );
}

export function PasswordField({
  label,
  aside,
  ...props
}: { label: string; aside?: React.ReactNode } & React.ComponentProps<"input">) {
  const [visible, setVisible] = useState(false);
  return (
    <Field label={label} aside={aside}>
      <div className="relative">
        <Input
          {...props}
          aria-label={label}
          type={visible ? "text" : "password"}
          className={cn(authInputClass, "pr-11")}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-1 my-auto flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </Field>
  );
}

export function FormAlert({
  tone,
  children,
}: {
  tone: "error" | "success";
  children: React.ReactNode;
}) {
  const Icon = tone === "error" ? CircleAlert : CircleCheck;
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm",
        tone === "error"
          ? "border-destructive/25 bg-destructive/5 text-destructive"
          : "border-success/25 bg-success/5 text-success",
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <p className="leading-snug">{children}</p>
    </div>
  );
}

export function SubmitButton({
  pending,
  pendingLabel,
  children,
}: {
  pending: boolean;
  pendingLabel: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="submit"
      size="lg"
      disabled={pending}
      className="h-11 w-full rounded-xl bg-foreground text-sm font-semibold text-background hover:bg-foreground/85"
    >
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

export function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-4.5">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.11A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.11V7.05H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.95l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}
