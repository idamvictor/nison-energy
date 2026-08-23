import type { Metadata } from "next";

import { AccountProfileForm } from "@/components/account/account-profile-form";

export const metadata: Metadata = { title: "Profile" };

export default function AccountProfilePage() {
  return <AccountProfileForm />;
}
