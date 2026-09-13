import { NextResponse } from "next/server";

import { getImageStream } from "@/lib/media/queries";

// Uses the S3 SDK — not edge-compatible.
export const runtime = "nodejs";

// Public — these are the actual images shown on public blog/product pages.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key } = await params;
  const objectKey = key.join("/");

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
      // Keys are random/unique per upload, so this is always safe to cache hard.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
