import type { Metadata } from "next";

import { AccountInbox } from "@/components/account/account-inbox";

export const metadata: Metadata = {
  title: "Inbox",
};

export default function Page() {
  return <AccountInbox />;
}
