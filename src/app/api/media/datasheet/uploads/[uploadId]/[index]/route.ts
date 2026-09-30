import { NextResponse } from "next/server";

import { adminOnly } from "@/lib/media/admin-guard";
import { DATASHEET_CHUNK_BYTES, MAX_DATASHEET_PARTS } from "@/lib/media/datasheet";
import { putDatasheetUploadPart } from "@/lib/media/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Receives one <=4MB part of a chunked datasheet upload (raw bytes). */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ uploadId: string; index: string }> },
) {
  const denied = await adminOnly();
  if (denied) return denied;

  const { uploadId, index: rawIndex } = await params;
  const index = Number(rawIndex);
  if (!UUID_RE.test(uploadId) || !Number.isInteger(index) || index < 0 || index >= MAX_DATASHEET_PARTS) {
    return NextResponse.json({ error: "Invalid upload part" }, { status: 400 });
  }

  const bytes = new Uint8Array(await request.arrayBuffer());
  if (bytes.byteLength === 0 || bytes.byteLength > DATASHEET_CHUNK_BYTES) {
    return NextResponse.json({ error: "Invalid part size" }, { status: 400 });
  }

  await putDatasheetUploadPart(uploadId, index, bytes);
  return NextResponse.json({ ok: true });
}
