import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { getDocumentStream } from "@/lib/media/queries";

// Uses the S3 SDK — not edge-compatible.
export const runtime = "nodejs";

// Private — owner (once Approved) or an admin (any status, for review).
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const quote = await prisma.quoteDocument.findUnique({ where: { id } });
  if (!quote) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isAdmin = user.role === "admin";
  const isOwner = quote.userId === user.id;
  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (isOwner && !isAdmin && quote.status !== "Approved") {
    return NextResponse.json(
      { error: "This quote isn't available to download yet." },
      { status: 403 },
    );
  }

  const object = await getDocumentStream(quote.fileKey);
  if (!object) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new Response(object.body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${quote.fileName}"`,
      // Access is re-checked on every request — never cache this response.
      "Cache-Control": "private, no-store",
    },
  });
}
