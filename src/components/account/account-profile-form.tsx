"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { accountCustomer } from "@/lib/account-mock";

export function AccountProfileForm() {
  const [saved, setSaved] = useState(false);

  return (
    <Card className="max-w-2xl">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Profile details</CardTitle>
        {saved && (
          <p className="text-sm font-medium text-success">
            Saved for preview — nothing is persisted yet.
          </p>
        )}
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            setSaved(true);
          }}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="First name">
              <Input required defaultValue={accountCustomer.firstName} />
            </Field>
            <Field label="Last name">
              <Input required defaultValue={accountCustomer.lastName} />
            </Field>
            <Field label="Email">
              <Input required type="email" defaultValue={accountCustomer.email} />
            </Field>
            <Field label="Phone number">
              <Input required type="tel" defaultValue={accountCustomer.phone} />
            </Field>
            <Field label="Address" className="sm:col-span-2">
              <Input defaultValue={accountCustomer.address} />
            </Field>
            <Field label="Postcode">
              <Input defaultValue={accountCustomer.postcode} />
            </Field>
          </div>

          <Button type="submit" className="w-fit">
            Save changes
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
