import type { Metadata } from "next";

import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot password | Ocunio Energy",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/30 p-4">
      <ForgotPasswordForm />
    </main>
  );
}
