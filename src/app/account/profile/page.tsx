import type { Metadata } from "next";

import { AccountProfileForm } from "@/components/account/account-profile-form";
import { requireUser } from "@/lib/auth-dal";

export const metadata: Metadata = { title: "Profile" };

export default async function AccountProfilePage() {
  const user = await requireUser();
  return <AccountProfileForm user={user} />;
}
