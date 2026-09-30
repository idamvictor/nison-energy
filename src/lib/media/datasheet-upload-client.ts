"use client";

import {
  DATASHEET_CHUNK_BYTES,
  MAX_DATASHEET_BYTES,
  formatFileSize,
} from "@/lib/media/datasheet";

export type UploadOutcome = { url: string } | { error: string };

async function readJson(res: Response): Promise<{ error?: string; url?: string; uploadId?: string }> {
  return (await res.json().catch(() => ({}))) as { error?: string; url?: string; uploadId?: string };
}

/**
 * Uploads one datasheet PDF from the admin's browser:
 * checks it, renders its page-1 preview image with pdf.js, then sends it in
 * <=4MB parts (Vercel caps a request at ~4.5MB) and completes the upload.
 * If this exact PDF is already stored, the server returns the existing URL.
 * `onProgress` receives 0–1.
 */
export async function uploadDatasheetFile(
  file: File,
  onProgress?: (fraction: number) => void,
): Promise<UploadOutcome> {
  if (file.type !== "application/pdf" && !/\.pdf$/i.test(file.name)) {
    return { error: "only PDF files can be uploaded" };
  }
  if (file.size > MAX_DATASHEET_BYTES) {
    return { error: `must be ${formatFileSize(MAX_DATASHEET_BYTES)} or smaller` };
  }

  try {
    onProgress?.(0);
    const init = await fetch("/api/media/datasheet/uploads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ size: file.size }),
    });
    const { uploadId, error: initError } = await readJson(init);
    if (!init.ok || !uploadId) return { error: initError ?? "upload failed, try again" };

    const parts = Math.max(1, Math.ceil(file.size / DATASHEET_CHUNK_BYTES));
    for (let index = 0; index < parts; index++) {
      const chunk = file.slice(index * DATASHEET_CHUNK_BYTES, (index + 1) * DATASHEET_CHUNK_BYTES);
      const res = await fetch(`/api/media/datasheet/uploads/${uploadId}/${index}`, {
        method: "PUT",
        headers: { "Content-Type": "application/octet-stream" },
        body: chunk,
      });
      if (!res.ok) return { error: (await readJson(res)).error ?? "upload failed, try again" };
      // Leave the last ~10% for the preview render + completion step.
      onProgress?.(((index + 1) / parts) * 0.9);
    }

    // Page-1 preview image so the card shows instantly (loaded on demand).
    // The PDF is kept anyway if this fails.
    const body = new FormData();
    body.append("fileName", file.name);
    const { renderPdfPreview } = await import("@/components/shared/datasheet/pdf-pages");
    const preview = await renderPdfPreview(file);
    if (preview) body.append("preview", preview, "preview");

    const done = await fetch(`/api/media/datasheet/uploads/${uploadId}/complete`, {
      method: "POST",
      body,
    });
    const { url, error } = await readJson(done);
    if (!done.ok || !url) return { error: error ?? "upload failed, try again" };
    onProgress?.(1);
    return { url };
  } catch {
    return { error: "upload failed — check your connection and try again" };
  }
}
