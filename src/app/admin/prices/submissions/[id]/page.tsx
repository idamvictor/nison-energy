import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SubmissionReview } from "@/components/admin/prices/submission-review";
import { getSubmission } from "@/lib/pricing-review/queries";
import { requirePermission } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Price review | Admin" };
export const dynamic = "force-dynamic";

export default async function AdminPriceSubmissionPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("prices.manage");
  const { id } = await params;
  const submission = await getSubmission(id);
  if (!submission) notFound();
  return <SubmissionReview submission={submission} />;
}
