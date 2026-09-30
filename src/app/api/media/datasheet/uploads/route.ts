import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { adminOnly } from "@/lib/media/admin-guard";
import { MAX_DATASHEET_BYTES, formatFileSize } from "@/lib/media/datasheet";
import { pruneDatasheetUploadParts } from "@/lib/media/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Starts a chunked datasheet upload. Vercel caps a request at ~4.5MB, so PDFs
 * are sent as <=4MB parts (PUT …/uploads/[id]/[index]) then assembled
 * (POST …/uploads/[id]/complete).
 */
export async function POST(request: Request) {
  const denied = await adminOnly();
  if (denied) return denied;

  const body = (await request.json().catch(() => null)) as { size?: unknown } | null;
  const size = Number(body?.size);
  if (!Number.isFinite(size) || size <= 0) {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  }
  if (size > MAX_DATASHEET_BYTES) {
    return NextResponse.json(
      { error: `PDF is too large (max ${formatFileSize(MAX_DATASHEET_BYTES)}).` },
      { status: 400 },
    );
  }

  // Housekeeping: clear parts from uploads abandoned more than a day ago.
  await pruneDatasheetUploadParts().catch(() => {});
  return NextResponse.json({ uploadId: randomUUID() }, { status: 201 });
}
