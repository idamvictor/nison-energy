"use client";

import { useRef, useState } from "react";
import { FileUp, Loader2 } from "lucide-react";

import {
  DATASHEET_CARD_HEIGHT,
  DATASHEET_CARD_WIDTH,
  DatasheetCard,
} from "@/components/shared/datasheet/datasheet-card";
import { cn } from "@/lib/utils";

// Mirrors MAX_DATASHEET_BYTES in src/lib/media/queries.ts (server enforces it too).
const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Plain PDF upload for a product datasheet — deliberately no media library,
 * just pick (or drop) a file from this device. Uploads to /api/media/datasheet.
 * Empty state is a card-sized drop zone so it's as visible as the filled card.
 */
export function DatasheetUploadField({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    if (file.type !== "application/pdf") {
      setError("Only PDF files can be uploaded.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("PDF must be 5MB or smaller.");
      return;
    }

    setUploading(true);
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
      if (!res.ok || !json.url) {
        setError(json.error ?? "Upload failed. Try again.");
        return;
      }
      onChange(json.url);
    } catch {
      setError("Upload failed. Check your connection and try again.");
    } finally {
      setUploading(false);
    }
  }

  const pickFile = () => inputRef.current?.click();

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          // Reset so picking the same file again still fires onChange.
          e.target.value = "";
          if (file) void handleFile(file);
        }}
      />

      {value && !uploading ? (
        <DatasheetCard
          key={value}
          url={value}
          onReplace={pickFile}
          onRemove={() => {
            setError(null);
            onChange(null);
          }}
        />
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={pickFile}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) void handleFile(file);
          }}
          className={cn(
            "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 text-center transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
            DATASHEET_CARD_WIDTH,
            DATASHEET_CARD_HEIGHT,
            dragging
              ? "border-foreground/40 bg-muted"
              : "border-border bg-muted/40 hover:border-foreground/25 hover:bg-muted",
          )}
        >
          <span className="flex size-12 items-center justify-center rounded-full bg-card text-muted-foreground shadow-xs ring-1 ring-border">
            {uploading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <FileUp className="size-5" />
            )}
          </span>
          <span className="flex flex-col gap-1">
            <span className="text-sm font-medium text-foreground">
              {uploading ? "Uploading…" : dragging ? "Drop to upload" : "Upload datasheet"}
            </span>
            <span className="text-xs text-muted-foreground">
              {uploading ? "This only takes a moment" : "Click or drag a PDF here · max 5MB"}
            </span>
          </span>
        </button>
      )}

      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Shown in the Datasheet tab on the product page. Save the product to apply changes.
        </p>
      )}
    </div>
  );
}
