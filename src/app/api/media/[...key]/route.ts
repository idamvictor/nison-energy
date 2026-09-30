import { NextResponse } from "next/server";

import { DATASHEET_CHUNK_BYTES } from "@/lib/media/datasheet";
import {
  DATASHEET_WHOLE_FILE_MAX,
  getDatasheetMeta,
  getDatasheetObject,
  getDatasheetRange,
  getImageStream,
  streamDatasheet,
} from "@/lib/media/queries";

// Uses the S3 SDK — not edge-compatible.
export const runtime = "nodejs";

// Keys are random/unique per upload, so this is always safe to cache hard.
// s-maxage lets a CDN in front of the app cache it too.
const IMMUTABLE = "public, max-age=31536000, s-maxage=31536000, immutable";

/**
 * Parses a single `Range: bytes=…` header against a file of `size` bytes.
 * Returns the inclusive [start, end], "invalid" for an unsatisfiable range,
 * or null when there's no (usable) Range header.
 */
function parseRange(header: string | null, size: number): [number, number] | "invalid" | null {
  const match = header?.match(/^bytes=(\d*)-(\d*)$/);
  if (!match) return null;
  const [, a, b] = match;
  if (a === "" && b === "") return "invalid";
  let start: number;
  let end: number;
  if (a === "") {
    // Suffix range: the last N bytes.
    start = Math.max(0, size - Number(b));
    end = size - 1;
  } else {
    start = Number(a);
    end = b === "" ? size - 1 : Math.min(Number(b), size - 1);
  }
  if (start >= size || start > end) return "invalid";
  // Keep every response under Vercel's ~4.5MB function limit.
  return [start, Math.min(end, start + DATASHEET_CHUNK_BYTES - 1)];
}

/**
 * Datasheet PDFs: byte-range aware so pdf.js fetches only the pages it needs,
 * and large files are streamed rather than buffered.
 */
async function serveDatasheetPdf(request: Request, objectKey: string) {
  const meta = await getDatasheetMeta(objectKey);
  // Display inline, and save under the original upload name when downloaded.
  const fileName = meta?.fileName ?? objectKey.split("/").pop() ?? "datasheet.pdf";
  const asciiName = fileName.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "");
  const baseHeaders = {
    "Content-Type": "application/pdf",
    "Accept-Ranges": "bytes",
    "Cache-Control": IMMUTABLE,
    // `?download=1` (the datasheet cards) forces a save instead of opening in a tab.
    "Content-Disposition": `${new URL(request.url).searchParams.has("download") ? "attachment" : "inline"}; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
  };

  if (!meta) {
    // Not in Postgres yet (legacy object-store upload): full read migrates it.
    const object = await getDatasheetObject(objectKey);
    if (!object) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return new Response(object.bytes as BodyInit, {
      headers: { ...baseHeaders, "Content-Length": String(object.bytes.byteLength) },
    });
  }

  const range = parseRange(request.headers.get("range"), meta.size);
  if (range === "invalid") {
    return new Response(null, {
      status: 416,
      headers: { ...baseHeaders, "Content-Range": `bytes */${meta.size}` },
    });
  }
  if (range) {
    const [start, end] = range;
    const bytes = await getDatasheetRange(objectKey, start, end);
    return new Response(bytes as BodyInit, {
      status: 206,
      headers: {
        ...baseHeaders,
        "Content-Range": `bytes ${start}-${start + bytes.byteLength - 1}/${meta.size}`,
        "Content-Length": String(bytes.byteLength),
      },
    });
  }

  if (meta.size <= DATASHEET_WHOLE_FILE_MAX) {
    const object = await getDatasheetObject(objectKey);
    if (!object) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return new Response(object.bytes as BodyInit, {
      headers: { ...baseHeaders, "Content-Length": String(object.bytes.byteLength) },
    });
  }
  // Large file, no range (e.g. Download): stream it in slices.
  return new Response(streamDatasheet(objectKey, meta.size), {
    headers: { ...baseHeaders, "Content-Length": String(meta.size) },
  });
}

// Public — these are the actual images shown on public blog/product pages.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key } = await params;
  const objectKey = key.join("/");

  if (objectKey.startsWith("datasheets/")) {
    if (objectKey.endsWith(".pdf")) return serveDatasheetPdf(request, objectKey);

    // Preview images: small, served whole from the in-memory cache.
    const object = await getDatasheetObject(objectKey);
    if (!object) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return new Response(object.bytes as BodyInit, {
      headers: {
        "Content-Type": object.contentType,
        "Content-Length": String(object.bytes.byteLength),
        "Cache-Control": IMMUTABLE,
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
