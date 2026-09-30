import { NextResponse } from "next/server";

import { adminOnly } from "@/lib/media/admin-guard";
import { completeDatasheetUpload } from "@/lib/media/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Finishes a chunked upload: assembles the parts, validates the PDF, stores it
 * (or returns the existing URL if this exact PDF is already stored).
 * FormData: `fileName`, optional `preview` (page-1 image from the browser).
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ uploadId: string }> },
) {
  const denied = await adminOnly();
  if (denied) return denied;

  const { uploadId } = await params;
  if (!UUID_RE.test(uploadId)) {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }
  const fileName = String(formData.get("fileName") ?? "datasheet.pdf");
  const preview = formData.get("preview");

  const result = await completeDatasheetUpload(
    uploadId,
    fileName,
    preview instanceof File
      ? { bytes: new Uint8Array(await preview.arrayBuffer()), contentType: preview.type }
      : null,
  );
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ url: result.url }, { status: 201 });
}
