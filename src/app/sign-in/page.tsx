import { Suspense } from "react";
import type { Metadata } from "next";

import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = {
  title: "Sign in | Ocunio Energy",
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/30 p-4">
      <Suspense>
        <SignInForm />
      </Suspense>
    </main>
  );
}
