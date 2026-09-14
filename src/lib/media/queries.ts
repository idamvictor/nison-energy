import "server-only";

import { randomUUID } from "node:crypto";

import {
  GetObjectCommand,
  NoSuchKey,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

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
