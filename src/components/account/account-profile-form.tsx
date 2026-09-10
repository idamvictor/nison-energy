"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth/client";
import type { SessionUser } from "@/lib/auth/session";

export function AccountProfileForm({ user }: { user: SessionUser }) {
  const router = useRouter();
  const [name, setName] = useState(user.name ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [address, setAddress] = useState(user.address ?? "");
  const [postcode, setPostcode] = useState(user.postcode ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setError(null);

    const { error } = await authClient.updateUser({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      postcode: postcode.trim(),
    });

    if (error) {
      setStatus("error");
      setError(error.message ?? "Could not save your changes.");
      return;
    }

    setStatus("saved");
    router.refresh();
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Profile details</CardTitle>
        {status === "saved" && (
          <p className="text-sm font-medium text-success">Saved.</p>
        )}
        {status === "error" && error && (
          <p className="text-sm font-medium text-destructive">{error}</p>
        )}
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Name" className="sm:col-span-2">
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <Field label="Email">
              <Input
                type="email"
                value={user.email}
                readOnly
                disabled
                aria-describedby="email-hint"
              />
              <span id="email-hint" className="text-xs text-muted-foreground">
                Contact us to change your email.
              </span>
            </Field>
            <Field label="Phone number">
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </Field>
            <Field label="Address" className="sm:col-span-2">
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </Field>
            <Field label="Postcode">
              <Input
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
              />
            </Field>
          </div>

          <Button
            type="submit"
            className="w-fit"
            disabled={status === "saving"}
          >
            {status === "saving" ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label
      className={`flex flex-col gap-1.5 text-sm font-medium text-foreground ${className ?? ""}`}
    >
      {label}
      {children}
    </label>
  );
}
