import "server-only";

import { randomUUID } from "node:crypto";
import { cache } from "react";

import {
  DeleteObjectCommand,
  GetObjectCommand,
  NoSuchKey,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import { prisma } from "@/lib/db";
import {
  DATASHEET_PREVIEW_TYPES,
  DATASHEET_URL_PREFIX,
  MAX_DATASHEET_PREVIEW_BYTES,
  datasheetPreviewKey,
  datasheetPreviewUrl,
  datasheetSafeName,
} from "@/lib/media/datasheet";

export { DATASHEET_URL_PREFIX };

// Prisma Object Store bucket (S3-compatible). Two kinds of object: public
// images under `uploads/` (see image-upload-field.tsx) and private
// server-generated documents under `quotes/` (see src/lib/quotes/).
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};
export const ALLOWED_IMAGE_TYPES = Object.keys(ALLOWED_TYPES);
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB

let client: S3Client | undefined;

function bucket(): string {
  const name = process.env.S3_BUCKET;
  if (!name) throw new Error("S3_BUCKET is not set");
  return name;
}

function s3(): S3Client {
  if (!client) {
    const endpoint = process.env.S3_ENDPOINT;
    const accessKeyId = process.env.S3_ACCESS_KEY_ID;
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
    if (!endpoint || !accessKeyId || !secretAccessKey) {
      throw new Error(
        "S3_ENDPOINT / S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY are not set — add your " +
          "Prisma Object Store credentials to .env",
      );
    }
    client = new S3Client({
      endpoint,
      region: process.env.S3_REGION || "auto",
      credentials: { accessKeyId, secretAccessKey },
    });
  }
  return client;
}

export type UploadedImage = { key: string; url: string };

/**
 * Validates and uploads an image, returning a stable proxy URL
 * (`/api/media/<key>`) — the bucket itself only hands out time-limited
 * presigned URLs, so the app never stores those directly.
 */
export async function uploadImage(file: File): Promise<
  { ok: true; image: UploadedImage } | { ok: false; error: string }
> {
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return {
      ok: false,
      error: "Unsupported file type. Use JPEG, PNG, WebP, GIF or AVIF.",
    };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, error: "Image is too large (max 8MB)." };
  }

  const key = `uploads/${randomUUID()}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  await s3().send(
    new PutObjectCommand({
      Bucket: bucket(),
      Key: key,
      Body: bytes,
      ContentType: file.type,
    }),
  );

  return { ok: true, image: { key, url: `/api/media/${key}` } };
}

export const MAX_DATASHEET_BYTES = 5 * 1024 * 1024; // 5MB

type UploadResult = { ok: true; url: string } | { ok: false; error: string };

/**
 * Validates and stores a product datasheet PDF (`datasheets/<uuid>/<name>.pdf`)
 * plus its optional page-1 preview image (rendered in the admin's browser —
 * see renderPdfPreview) at `datasheets/<uuid>/preview`. Both live in the
 * DatasheetFile table and are served publicly through /api/media.
 */
export async function uploadDatasheet(
  file: File,
  preview: File | null,
): Promise<UploadResult> {
  if (file.type !== "application/pdf") {
    return { ok: false, error: "Unsupported file type. Upload a PDF." };
  }
  if (file.size > MAX_DATASHEET_BYTES) {
    return { ok: false, error: "PDF is too large (max 5MB)." };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  // Check the "%PDF-" magic bytes so a renamed non-PDF can't slip through.
  if (!startsWith(bytes, PDF_MAGIC)) {
    return { ok: false, error: "That file isn't a valid PDF." };
  }

  // The preview is a nice-to-have: skip (rather than fail the upload) if it's
  // missing or doesn't look like the WebP/PNG we asked the browser for.
  let previewObject: CachedObject | null = null;
  if (
    preview &&
    DATASHEET_PREVIEW_TYPES.includes(preview.type) &&
    preview.size <= MAX_DATASHEET_PREVIEW_BYTES
  ) {
    const candidate = new Uint8Array(await preview.arrayBuffer());
    if (isWebp(candidate) || startsWith(candidate, PNG_MAGIC)) {
      previewObject = { bytes: candidate, contentType: preview.type };
    }
  }

  // Keep the original name in the key so the UI (and downloads) can show it.
  const key = `datasheets/${randomUUID()}/${datasheetSafeName(file.name)}.pdf`;
  const pdfObject: CachedObject = { bytes, contentType: "application/pdf" };
  const previewKey = datasheetPreviewKey(key);
  await prisma.datasheetFile.createMany({
    data: [
      { key, contentType: pdfObject.contentType, bytes },
      ...(previewObject
        ? [{ key: previewKey, contentType: previewObject.contentType, bytes: previewObject.bytes }]
        : []),
    ],
  });
  // Warm the (process-wide) cache so the card/preview right after upload is instant.
  rememberDatasheet(key, pdfObject);
  if (previewObject) rememberDatasheet(previewKey, previewObject);
  return { ok: true, url: `/api/media/${key}` };
}

const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46, 0x2d]; // "%PDF-"
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47];

function startsWith(bytes: Uint8Array, magic: number[], offset = 0): boolean {
  return magic.every((b, i) => bytes[offset + i] === b);
}

function isWebp(bytes: Uint8Array): boolean {
  // "RIFF" .... "WEBP"
  return startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8);
}

// Recently used datasheet files in memory, on top of Postgres. Kept on
// globalThis because Next bundles each route separately — a module-level Map
// would give the upload route, the media route and page renders each their
// own cache, so warming it in one would never help another.
type CachedObject = { bytes: Uint8Array<ArrayBuffer>; contentType: string };
type DatasheetCache = {
  entries: Map<string, CachedObject>;
  inflight: Map<string, Promise<CachedObject | null>>;
  bytes: number;
};
const DATASHEET_CACHE_MAX_BYTES = 64 * 1024 * 1024;
const globalForDatasheets = globalThis as unknown as { datasheetCache?: DatasheetCache };
const datasheetCache = (globalForDatasheets.datasheetCache ??= {
  entries: new Map(),
  inflight: new Map(),
  bytes: 0,
});

function forgetDatasheet(key: string) {
  const existing = datasheetCache.entries.get(key);
  if (existing) {
    datasheetCache.entries.delete(key);
    datasheetCache.bytes -= existing.bytes.byteLength;
  }
}

function rememberDatasheet(key: string, object: CachedObject) {
  forgetDatasheet(key);
  datasheetCache.entries.set(key, object);
  datasheetCache.bytes += object.bytes.byteLength;
  // Map iteration order is insertion order, so the first key is the least recently used.
  for (const [oldKey] of datasheetCache.entries) {
    if (datasheetCache.bytes <= DATASHEET_CACHE_MAX_BYTES) break;
    forgetDatasheet(oldKey);
  }
}

/** Reads a datasheet file from Postgres; migrates legacy object-store copies on first read. */
async function loadDatasheet(key: string): Promise<CachedObject | null> {
  const row = await prisma.datasheetFile.findUnique({ where: { key } });
  if (row) return { bytes: new Uint8Array(row.bytes), contentType: row.contentType };

  // Uploaded before datasheets moved to Postgres — fetch from the (slow)
  // bucket once and copy it across so every later read is fast.
  const object = await getObjectStream(key);
  if (!object) return null;
  const bytes = new Uint8Array(await new Response(object.body).arrayBuffer());
  await prisma.datasheetFile.upsert({
    where: { key },
    create: { key, contentType: object.contentType, bytes },
    update: {},
  });
  return { bytes, contentType: object.contentType };
}

/**
 * A datasheet file (PDF or preview image) in full — from memory, else one
 * shared Postgres read. Null if missing.
 */
export async function getDatasheetObject(key: string): Promise<CachedObject | null> {
  const cached = datasheetCache.entries.get(key);
  if (cached) {
    rememberDatasheet(key, cached); // bump to most recently used
    return cached;
  }
  let pending = datasheetCache.inflight.get(key);
  if (!pending) {
    pending = loadDatasheet(key)
      .then((object) => {
        if (object) rememberDatasheet(key, object);
        return object;
      })
      .finally(() => datasheetCache.inflight.delete(key));
    datasheetCache.inflight.set(key, pending);
  }
  return pending;
}

/**
 * Fire-and-forget: pull a datasheet (and its preview) into memory while its
 * product page renders, so the viewer usually finds it cached on first click.
 */
export function warmDatasheet(url: string | null | undefined): void {
  if (!url?.startsWith(DATASHEET_URL_PREFIX)) return;
  const key = url.slice("/api/media/".length);
  const keys = datasheetPreviewUrl(url) ? [key, datasheetPreviewKey(key)] : [key];
  for (const k of keys) {
    getDatasheetObject(k).catch((error) =>
      console.error("Failed to warm datasheet cache", error),
    );
  }
}

/**
 * Deletes a datasheet (and its preview image, if any) by its
 * `/api/media/datasheets/…` URL; ignores other URLs.
 */
export async function deleteDatasheet(url: string | null | undefined): Promise<void> {
  if (!url?.startsWith(DATASHEET_URL_PREFIX)) return;
  const key = url.slice("/api/media/".length);
  const keys = datasheetPreviewUrl(url) ? [key, datasheetPreviewKey(key)] : [key];
  keys.forEach(forgetDatasheet);
  try {
    await prisma.datasheetFile.deleteMany({ where: { key: { in: keys } } });
    // Older uploads may also still sit in the bucket (deleting a missing key is a no-op).
    await Promise.all(keys.map((k) => deleteDocument(k)));
  } catch (error) {
    // Orphaned bytes are harmless — never fail the product save over this.
    console.error("Failed to delete old datasheet", error);
  }
}

type ObjectStream = {
  body: ReadableStream;
  contentType: string;
  contentLength?: number;
};

/**
 * Streams an object back out. Returns null for a missing key (caller 404s).
 */
async function getObjectStream(key: string): Promise<ObjectStream | null> {
  try {
    const res = await s3().send(
      new GetObjectCommand({ Bucket: bucket(), Key: key }),
    );
    if (!res.Body) return null;
    return {
      body: await res.Body.transformToWebStream(),
      contentType: res.ContentType ?? "application/octet-stream",
      contentLength: res.ContentLength,
    };
  } catch (error) {
    if (error instanceof NoSuchKey) return null;
    // Some S3-compatible providers report a missing key as a generic 404
    // rather than the typed NoSuchKey error — treat that the same way.
    if (
      error &&
      typeof error === "object" &&
      "$metadata" in error &&
      (error as { $metadata?: { httpStatusCode?: number } }).$metadata
        ?.httpStatusCode === 404
    ) {
      return null;
    }
    throw error;
  }
}

/** Public images (products, blog) — served unauthenticated by /api/media/[...key]. */
export const getImageStream = getObjectStream;

/**
 * Uploads a server-generated document (e.g. a quote PDF) under `quotes/`, kept
 * separate from `uploads/` (images) so the two are easy to tell apart in the
 * bucket. Unlike images, these are never served through the public
 * /api/media route — only through an ownership-checked route.
 */
export async function uploadDocument(
  bytes: Uint8Array,
  opts: { contentType: string; ext: string },
): Promise<{ key: string }> {
  const key = `quotes/${randomUUID()}.${opts.ext}`;
  await s3().send(
    new PutObjectCommand({
      Bucket: bucket(),
      Key: key,
      Body: bytes,
      ContentType: opts.contentType,
    }),
  );
  return { key };
}

/** Private documents (quote PDFs) — served through an ownership-checked route. */
export const getDocumentStream = getObjectStream;

/** Removes an object (e.g. a quote document) from the bucket. */
export async function deleteDocument(key: string): Promise<void> {
  await s3().send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }));
}

/**
 * Every image URL currently referenced by a product (card + gallery) or a
 * blog post (cover image) — the "file manager" picker in
 * src/components/shared/image-upload-field.tsx browses this list instead of
 * re-uploading an image that's already in use elsewhere.
 */
export const getMediaLibrary = cache(async (): Promise<string[]> => {
  const [products, posts] = await Promise.all([
    prisma.product.findMany({ select: { cardImage: true, gallery: true } }),
    prisma.post.findMany({ select: { coverImage: true } }),
  ]);
  const urls = new Set<string>();
  for (const p of products) {
    if (p.cardImage) urls.add(p.cardImage);
    p.gallery.forEach((u) => urls.add(u));
  }
  for (const post of posts) {
    if (post.coverImage) urls.add(post.coverImage);
  }
  return Array.from(urls);
});
