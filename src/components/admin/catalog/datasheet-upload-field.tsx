"use client";

import { useRef, useState } from "react";
import { FileUp, Loader2 } from "lucide-react";

import {
  DATASHEET_CARD_HEIGHT,
  DATASHEET_CARD_WIDTH,
  DatasheetCard,
} from "@/components/shared/datasheet/datasheet-card";
import { MAX_DATASHEETS } from "@/lib/media/datasheet";
import { cn } from "@/lib/utils";

// Mirrors MAX_DATASHEET_BYTES in src/lib/media/queries.ts (server enforces it too).
const MAX_BYTES = 5 * 1024 * 1024;

/** Uploads one PDF (plus its page-1 preview image). Returns its URL or an error. */
async function uploadPdf(file: File): Promise<{ url: string } | { error: string }> {
  if (file.type !== "application/pdf") return { error: "only PDF files can be uploaded" };
  if (file.size > MAX_BYTES) return { error: "must be 5MB or smaller" };
  try {
    const body = new FormData();
    body.append("file", file);
    // Page-1 preview image so the card shows instantly — rendered here with
    // pdf.js (loaded on demand). Upload the PDF anyway if this fails.
    const { renderPdfPreview } = await import("@/components/shared/datasheet/pdf-pages");
    const preview = await renderPdfPreview(file);
    if (preview) body.append("preview", preview, "preview");
    const res = await fetch("/api/media/datasheet", { method: "POST", body });
    const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
    if (!res.ok || !json.url) return { error: json.error ?? "upload failed, try again" };
    return { url: json.url };
  } catch {
    return { error: "upload failed — check your connection and try again" };
  }
}

/**
 * A product's datasheets as a gallery of Drive-style cards plus an "Add
 * datasheet" tile. Plain PDF uploads (no media library); several files can be
 * picked or dropped at once and upload one after another. Order here is the
 * order on the product page.
 */
export function DatasheetsField({
  value,
  onChange,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
}) {
  const addInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const replaceIndex = useRef<number | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [replacing, setReplacing] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const room = MAX_DATASHEETS - value.length;
  const busy = progress !== null || replacing !== null;

  async function addFiles(files: File[]) {
    if (files.length === 0 || busy) return;
    const problems: string[] = [];
    if (files.length > room) {
      problems.push(
        `Only ${room} more datasheet${room === 1 ? "" : "s"} can be added (max ${MAX_DATASHEETS}) — the rest were skipped.`,
      );
      files = files.slice(0, room);
    }
    // Accumulate locally so each finished upload appears straight away.
    let current = [...value];
    setProgress({ done: 0, total: files.length });
    for (const [i, file] of files.entries()) {
      const result = await uploadPdf(file);
      if ("url" in result) {
        current = [...current, result.url];
        onChange(current);
      } else {
        problems.push(`${file.name} — ${result.error}.`);
      }
      setProgress({ done: i + 1, total: files.length });
    }
    setProgress(null);
    setErrors(problems);
  }

  async function replaceAt(index: number, file: File) {
    setReplacing(index);
    const result = await uploadPdf(file);
    setReplacing(null);
    if ("url" in result) {
      onChange(value.map((url, i) => (i === index ? result.url : url)));
      setErrors([]);
    } else {
      setErrors([`${file.name} — ${result.error}.`]);
    }
  }

  function move(index: number, by: -1 | 1) {
    const next = [...value];
    [next[index], next[index + by]] = [next[index + by], next[index]];
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={addInputRef}
        type="file"
        accept="application/pdf,.pdf"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = [...(e.target.files ?? [])];
          // Reset so picking the same file again still fires onChange.
          e.target.value = "";
          void addFiles(files);
        }}
      />
      <input
        ref={replaceInputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file && replaceIndex.current !== null) void replaceAt(replaceIndex.current, file);
        }}
      />

      <div className="flex flex-wrap gap-4">
        {value.map((url, index) =>
          replacing === index ? (
            <UploadingTile key={url} label="Replacing…" />
          ) : (
            <DatasheetCard
              key={url}
              url={url}
              onMoveLeft={index > 0 ? () => move(index, -1) : undefined}
              onMoveRight={index < value.length - 1 ? () => move(index, 1) : undefined}
              onReplace={() => {
                replaceIndex.current = index;
                replaceInputRef.current?.click();
              }}
              onRemove={() => {
                setErrors([]);
                onChange(value.filter((_, i) => i !== index));
              }}
            />
          ),
        )}

        {progress && progress.done < progress.total && (
          <UploadingTile label={`Uploading ${progress.done + 1} of ${progress.total}…`} />
        )}

        {room > 0 && !progress && (
          <button
            type="button"
            disabled={busy}
            onClick={() => addInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              void addFiles([...(e.dataTransfer.files ?? [])]);
            }}
            className={cn(
              "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 text-center transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-60",
              DATASHEET_CARD_WIDTH,
              DATASHEET_CARD_HEIGHT,
              dragging
                ? "border-foreground/40 bg-muted"
                : "border-border bg-muted/40 hover:border-foreground/25 hover:bg-muted",
            )}
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-card text-muted-foreground shadow-xs ring-1 ring-border">
              <FileUp className="size-5" />
            </span>
            <span className="flex flex-col gap-1">
              <span className="text-sm font-medium text-foreground">
                {dragging ? "Drop to upload" : value.length ? "Add datasheet" : "Upload datasheets"}
              </span>
              <span className="text-xs text-muted-foreground">
                Click or drag PDFs here · you can add several at once
              </span>
            </span>
          </button>
        )}
      </div>

      {errors.length > 0 && (
        <ul className="flex flex-col gap-1">
          {errors.map((message) => (
            <li key={message} className="text-xs text-destructive">
              {message}
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-muted-foreground">
        PDF only, max 5MB each · up to {MAX_DATASHEETS} · shown in this order in the product&apos;s
        Datasheet tab. Save the product to apply changes.
      </p>
    </div>
  );
}

function UploadingTile({ label }: { label: string }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/40 text-center",
        DATASHEET_CARD_WIDTH,
        DATASHEET_CARD_HEIGHT,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-card text-muted-foreground shadow-xs ring-1 ring-border">
        <Loader2 className="size-5 animate-spin" />
      </span>
      <span className="text-sm font-medium text-foreground">{label}</span>
    </div>
  );
}
