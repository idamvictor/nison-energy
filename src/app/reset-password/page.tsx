import { Suspense } from "react";
import type { Metadata } from "next";

import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = {
  title: "Set a new password | Ocunio Energy",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/30 p-4">
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
