"use client";

import { useEffect, useRef, useState } from "react";
import { FileUp, LibraryBig, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DatasheetLibraryDialog } from "@/components/admin/catalog/datasheet-library-dialog";
import {
  DATASHEET_CARD_HEIGHT,
  DATASHEET_CARD_WIDTH,
  DatasheetCard,
} from "@/components/shared/datasheet/datasheet-card";
import { MAX_DATASHEETS, MAX_DATASHEET_BYTES, formatFileSize } from "@/lib/media/datasheet";
import { uploadDatasheetFile } from "@/lib/media/datasheet-upload-client";
import { cn } from "@/lib/utils";

/**
 * A product's datasheets as a gallery of Drive-style cards plus an "Add
 * datasheet" tile and the shared PDF library. PDFs are stored once and linked
 * by URL — removing one here only unlinks it from this product (it stays in
 * the library for other products). Order here is the order on the product page.
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
  const [progress, setProgress] = useState<{ file: number; total: number; percent: number } | null>(
    null,
  );
  const [replacing, setReplacing] = useState<{ index: number; percent: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  // Original file names by URL (the URL itself only has a web-safe slug).
  const [names, setNames] = useState<Record<string, string>>({});
  const nameFor = (url: string, fileName: string) =>
    setNames((prev) => (prev[url] ? prev : { ...prev, [url]: fileName }));

  useEffect(() => {
    // Load the stored names for this product's datasheets once.
    let cancelled = false;
    fetch("/api/media/datasheet/library", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json: { items?: { url: string; fileName: string }[] } | null) => {
        if (cancelled || !json?.items) return;
        setNames((prev) => ({
          ...Object.fromEntries(json.items!.map((i) => [i.url, i.fileName])),
          ...prev,
        }));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

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
    for (const [i, file] of files.entries()) {
      setProgress({ file: i + 1, total: files.length, percent: 0 });
      const result = await uploadDatasheetFile(file, (f) =>
        setProgress({ file: i + 1, total: files.length, percent: Math.round(f * 100) }),
      );
      if ("url" in result) {
        nameFor(result.url, file.name);
        // An identical PDF already stored comes back as the same URL — no duplicate.
        if (!current.includes(result.url)) {
          current = [...current, result.url];
          onChange(current);
        }
      } else {
        problems.push(`${file.name} — ${result.error}.`);
      }
    }
    setProgress(null);
    setErrors(problems);
  }

  async function replaceAt(index: number, file: File) {
    setReplacing({ index, percent: 0 });
    const result = await uploadDatasheetFile(file, (f) =>
      setReplacing({ index, percent: Math.round(f * 100) }),
    );
    setReplacing(null);
    if ("url" in result) {
      nameFor(result.url, file.name);
      onChange(
        value
          .map((url, i) => (i === index ? result.url : url))
          .filter((url, i, all) => all.indexOf(url) === i),
      );
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

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {value.length
            ? `${value.length} of ${MAX_DATASHEETS} datasheets`
            : "No datasheets yet — upload PDFs or pick existing ones from the library."}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy || room === 0}
          onClick={() => setLibraryOpen(true)}
        >
          <LibraryBig />
          Choose from library
        </Button>
      </div>

      <div className="flex flex-wrap gap-4">
        {value.map((url, index) =>
          replacing?.index === index ? (
            <UploadingTile key={url} label="Replacing…" percent={replacing.percent} />
          ) : (
            <DatasheetCard
              key={url}
              url={url}
              name={names[url]}
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

        {progress && (
          <UploadingTile
            label={
              progress.total > 1
                ? `Uploading ${progress.file} of ${progress.total}`
                : "Uploading…"
            }
            percent={progress.percent}
          />
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
        PDF only, max {formatFileSize(MAX_DATASHEET_BYTES)} each · up to {MAX_DATASHEETS} · shown in
        this order in the product&apos;s Datasheet tab. The same PDF is only ever stored once —
        removing it here just unlinks it from this product. Save the product to apply changes.
      </p>

      <DatasheetLibraryDialog
        open={libraryOpen}
        onOpenChange={setLibraryOpen}
        attached={value}
        room={room}
        onAdd={(items) => {
          for (const item of items) if (item.fileName) nameFor(item.url, item.fileName);
          const urls = items.map((i) => i.url).filter((u) => !value.includes(u));
          onChange([...value, ...urls].slice(0, MAX_DATASHEETS));
        }}
      />
    </div>
  );
}

function UploadingTile({ label, percent }: { label: string; percent: number }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/40 px-6 text-center",
        DATASHEET_CARD_WIDTH,
        DATASHEET_CARD_HEIGHT,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-card text-muted-foreground shadow-xs ring-1 ring-border">
        <Loader2 className="size-5 animate-spin" />
      </span>
      <span className="text-sm font-medium text-foreground">
        {label} · {percent}%
      </span>
      <span className="h-1.5 w-full overflow-hidden rounded-full bg-border">
        <span
          className="block h-full rounded-full bg-foreground transition-[width] duration-300"
          style={{ width: `${percent}%` }}
        />
      </span>
    </div>
  );
}
