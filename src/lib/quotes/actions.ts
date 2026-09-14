"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { createNotification } from "@/lib/notifications/queries";
import { sendEmail } from "@/lib/email/client";
import { quoteApprovedEmail, quoteRejectedEmail } from "@/lib/email/templates";
import { quoteSchemeLabels, type QuoteActionResult } from "@/lib/quotes/types";

function revalidate(id: string) {
  revalidatePath("/admin/quotes");
  revalidatePath(`/admin/quotes/${id}`);
  revalidatePath("/admin");
  revalidatePath("/account/quotes");
  revalidatePath("/account/inbox");
}

export async function reviewQuote(
  id: string,
  decision: "approve" | "reject",
  reason?: string,
): Promise<QuoteActionResult> {
  const me = await requireAdmin();

  const existing = await prisma.quoteDocument.findUnique({
    where: { id },
    include: { user: { select: { email: true } } },
  });
  if (!existing) return { ok: false, error: "Quote not found." };
  if (existing.status !== "Pending") {
    return { ok: false, error: "This quote has already been reviewed." };
  }

  const status = decision === "approve" ? "Approved" : "Rejected";
  const rejectionReason = decision === "reject" ? reason?.trim() || null : null;

  const quote = await prisma.quoteDocument.update({
    where: { id },
    data: {
      status,
      reviewedById: me.id,
      reviewedAt: new Date(),
      rejectionReason,
    },
  });

  const schemeLabel = quoteSchemeLabels[quote.scheme];

  if (status === "Approved") {
    await createNotification({
      userId: quote.userId,
      kind: "quote",
      title: `Your ${schemeLabel} quote is ready to download`,
      href: "/account/quotes",
    });
    after(async () => {
      await sendEmail({
        to: existing.user.email,
        ...quoteApprovedEmail({ reference: quote.reference, schemeLabel }),
      });
    });
  } else {
    await createNotification({
      userId: quote.userId,
      kind: "quote",
      title: `Your ${schemeLabel} quote needs changes`,
      body: rejectionReason ?? undefined,
      href: "/account/quotes",
    });
    after(async () => {
      await sendEmail({
        to: existing.user.email,
        ...quoteRejectedEmail({
          reference: quote.reference,
          schemeLabel,
          rejectionReason,
        }),
      });
    });
  }

  revalidate(id);
  return { ok: true };
}
