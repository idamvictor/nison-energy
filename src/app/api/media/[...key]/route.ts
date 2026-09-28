import { NextResponse } from "next/server";

import { getDatasheetObject, getImageStream } from "@/lib/media/queries";

// Uses the S3 SDK — not edge-compatible.
export const runtime = "nodejs";

// Keys are random/unique per upload, so this is always safe to cache hard.
// s-maxage lets a CDN in front of the app cache it too.
const IMMUTABLE = "public, max-age=31536000, s-maxage=31536000, immutable";

// Public — these are the actual images shown on public blog/product pages.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key } = await params;
  const objectKey = key.join("/");

  // Datasheets (PDFs and their preview images) are served whole from an
  // in-memory cache — the bucket streams too slowly for pdf.js (see
  // getDatasheetObject).
  if (objectKey.startsWith("datasheets/")) {
    const object = await getDatasheetObject(objectKey);
    if (!object) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const isPdf = objectKey.endsWith(".pdf");
    return new Response(object.bytes as BodyInit, {
      headers: {
        "Content-Type": isPdf ? "application/pdf" : object.contentType,
        "Content-Length": String(object.bytes.byteLength),
        "Cache-Control": IMMUTABLE,
        // PDFs: display inline, and save under the real name when downloaded.
        ...(isPdf
          ? { "Content-Disposition": `inline; filename="${objectKey.split("/").pop()}"` }
          : {}),
      },
    });
  }

  const object = await getImageStream(objectKey);
  if (!object) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new Response(object.body, {
    headers: {
      "Content-Type": object.contentType,
      ...(object.contentLength != null
        ? { "Content-Length": String(object.contentLength) }
        : {}),
      "Cache-Control": IMMUTABLE,
    },
  });
}
