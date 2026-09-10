import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth-dal";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = {
  title: "Sign in | Ocunio Energy",
  robots: { index: false, follow: false },
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) {
    const { redirect: target } = await searchParams;
    redirect(target?.startsWith("/") && !target.startsWith("//") ? target : "/account");
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/30 p-4">
      <Suspense>
        <SignInForm />
      </Suspense>
    </main>
  );
}
