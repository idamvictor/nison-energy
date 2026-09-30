"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Download, FileText, Loader2, Search, Trash2, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PdfChip, datasheetDownloadUrl } from "@/components/shared/datasheet/datasheet-card";
import { datasheetPreviewUrl, formatFileSize } from "@/lib/media/datasheet";
import { uploadDatasheetFile } from "@/lib/media/datasheet-upload-client";
import { cn } from "@/lib/utils";

type LibraryItem = {
  url: string;
  fileName: string;
  size: number | null;
  createdAt: string;
  usedBy: { id: string; name: string }[];
};

function Thumb({ url }: { url: string }) {
  const previewUrl = datasheetPreviewUrl(url);
  const [failed, setFailed] = useState(false);
  if (!previewUrl || failed) {
    return (
      <div className="flex size-full items-center justify-center text-muted-foreground">
        <FileText className="size-8" />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- small pre-rendered preview; skip the optimizer
    <img
      src={previewUrl}
      alt=""
      onError={() => setFailed(true)}
      className="size-full object-cover object-top"
    />
  );
}

/**
 * The admin PDF library: every datasheet ever uploaded, stored once and
 * shared by URL. Pick several to attach to a product, upload new ones, or
 * delete PDFs no product uses any more.
 */
export function DatasheetLibraryDialog({
  open,
  onOpenChange,
  attached,
  room,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** URLs already on this product (shown as "Added"). */
  attached: string[];
  /** How many more this product can take. */
  room: number;
  /** Selected PDFs, with their original file names. */
  onAdd: (items: { url: string; fileName: string }[]) => void;
}) {
  const [items, setItems] = useState<LibraryItem[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [uploading, setUploading] = useState<{ name: string; percent: number } | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function load() {
    setLoadError(null);
    try {
      const res = await fetch("/api/media/datasheet/library", { cache: "no-store" });
      const json = (await res.json()) as { items?: LibraryItem[]; error?: string };
      if (!res.ok || !json.items) throw new Error(json.error);
      setItems(json.items);
    } catch (error) {
      const detail = error instanceof Error && error.message ? ` (${error.message})` : "";
      setLoadError(`Couldn't load the PDF library${detail}. Try again.`);
    }
  }

  useEffect(() => {
    if (!open) return;
    // Fresh selection and data every time the library opens.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset on open
    setSelected([]);
    setMessages([]);
    void load();
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (items ?? []).filter(
      (item) =>
        !q ||
        item.fileName.toLowerCase().includes(q) ||
        item.usedBy.some((p) => p.name.toLowerCase().includes(q)),
    );
  }, [items, query]);

  function toggle(url: string) {
    setSelected((prev) => {
      if (prev.includes(url)) return prev.filter((u) => u !== url);
      if (prev.length >= room) return prev;
      return [...prev, url];
    });
  }

  async function uploadFiles(files: File[]) {
    const problems: string[] = [];
    const added: string[] = [];
    for (const file of files) {
      setUploading({ name: file.name, percent: 0 });
      const result = await uploadDatasheetFile(file, (f) =>
        setUploading({ name: file.name, percent: Math.round(f * 100) }),
      );
      if ("url" in result) added.push(result.url);
      else problems.push(`${file.name} — ${result.error}.`);
    }
    setUploading(null);
    await load();
    // Pre-select what was just uploaded (or matched an existing identical PDF).
    setSelected((prev) => {
      const next = [...prev];
      for (const url of added) {
        if (!next.includes(url) && !attached.includes(url) && next.length < room) next.push(url);
      }
      return next;
    });
    setMessages(problems);
  }

  async function remove(item: LibraryItem) {
    const res = await fetch(`/api/media/datasheet/library?url=${encodeURIComponent(item.url)}`, {
      method: "DELETE",
    });
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    setConfirmDelete(null);
    if (!res.ok) {
      setMessages([json.error ?? "Couldn't delete that PDF."]);
      return;
    }
    setSelected((prev) => prev.filter((u) => u !== item.url));
    setItems((prev) => prev?.filter((i) => i.url !== item.url) ?? prev);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="flex h-[100svh] max-h-[100svh] w-full max-w-full flex-col gap-0 overflow-hidden rounded-none p-0 sm:h-[88svh] sm:max-w-5xl sm:rounded-2xl"
        >
          <div className="flex flex-col gap-3 border-b border-border bg-card px-4 pt-4 pb-3 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <DialogTitle className="text-lg font-semibold">PDF library</DialogTitle>
                <p className="text-xs text-muted-foreground">
                  Every PDF is stored once and can be shared by any number of products.
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Close"
                onClick={() => onOpenChange(false)}
              >
                <X />
              </Button>
            </div>
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <label className="relative flex-1">
                <span className="sr-only">Search PDFs</span>
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by file name or product…"
                  className="h-10 rounded-xl bg-background pl-9"
                />
              </label>
              <input
                ref={fileInput}
                type="file"
                accept="application/pdf,.pdf"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = [...(e.target.files ?? [])];
                  e.target.value = "";
                  if (files.length) void uploadFiles(files);
                }}
              />
              <Button
                type="button"
                variant="outline"
                disabled={uploading !== null}
                onClick={() => fileInput.current?.click()}
                className="h-10 rounded-xl"
              >
                {uploading ? <Loader2 className="animate-spin" /> : <Upload />}
                {uploading ? `Uploading ${uploading.percent}%` : "Upload new PDFs"}
              </Button>
            </div>
            {uploading && (
              <p className="truncate text-xs text-muted-foreground">Uploading {uploading.name}…</p>
            )}
            {messages.map((m) => (
              <p key={m} className="text-xs text-destructive">
                {m}
              </p>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto bg-muted/40 px-4 py-5 sm:px-6">
            {loadError ? (
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <p className="text-sm text-destructive">{loadError}</p>
                <Button type="button" variant="outline" size="sm" onClick={() => void load()}>
                  Try again
                </Button>
              </div>
            ) : items === null ? (
              <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Loading PDFs…
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-card py-16 text-center">
                <FileText className="size-8 text-muted-foreground" />
                <p className="font-medium text-foreground">
                  {items.length === 0 ? "No PDFs uploaded yet" : "No PDFs match your search"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                {filtered.map((item) => {
                  const isAttached = attached.includes(item.url);
                  const isSelected = selected.includes(item.url);
                  const unused = item.usedBy.length === 0;
                  return (
                    <div
                      key={item.url}
                      className={cn(
                        "group relative flex flex-col overflow-hidden rounded-2xl border bg-card transition-all",
                        isSelected
                          ? "border-foreground ring-2 ring-primary/40"
                          : "border-border hover:border-primary/50",
                      )}
                    >
                      <button
                        type="button"
                        disabled={isAttached}
                        aria-pressed={isSelected}
                        onClick={() => toggle(item.url)}
                        className="relative h-32 bg-white text-left focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-default"
                      >
                        <Thumb url={item.url} />
                        <span
                          className={cn(
                            "absolute top-2 left-2 flex size-6 items-center justify-center rounded-md border-2 shadow-sm",
                            isAttached
                              ? "border-success bg-success text-white"
                              : isSelected
                                ? "border-foreground bg-foreground text-background"
                                : "border-foreground/35 bg-white text-transparent group-hover:border-foreground/60",
                          )}
                        >
                          <Check className="size-3.5" />
                        </span>
                        {isAttached && (
                          <span className="absolute top-2 right-2 rounded-full bg-success px-2 py-0.5 text-xs font-semibold text-white">
                            Added
                          </span>
                        )}
                      </button>
                      <div className="flex flex-1 flex-col gap-1 border-t border-border/70 p-3">
                        <div className="flex items-start gap-1.5">
                          <PdfChip />
                          <p
                            className="line-clamp-2 min-w-0 flex-1 text-xs leading-snug font-medium text-foreground"
                            title={item.fileName}
                          >
                            {item.fileName}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(item.size)}
                          {item.size ? " · " : ""}
                          <span
                            title={item.usedBy.map((p) => p.name).join("\n") || undefined}
                            className={cn(unused && "text-accent-strong")}
                          >
                            {unused
                              ? "Not used"
                              : `Used by ${item.usedBy.length} product${item.usedBy.length === 1 ? "" : "s"}`}
                          </span>
                        </p>
                        <div className="mt-auto flex items-center gap-1 pt-1">
                          <Button
                            variant="ghost"
                            size="xs"
                            nativeButton={false}
                            render={<a href={datasheetDownloadUrl(item.url)} download={item.fileName} />}
                          >
                            <Download />
                            Download
                          </Button>
                          {unused &&
                            (confirmDelete === item.url ? (
                              <Button
                                type="button"
                                variant="destructive"
                                size="xs"
                                onClick={() => void remove(item)}
                              >
                                Confirm delete
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                variant="ghost"
                                size="xs"
                                className="text-muted-foreground hover:text-destructive"
                                onClick={() => setConfirmDelete(item.url)}
                              >
                                <Trash2 />
                                Delete
                              </Button>
                            ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-card px-4 py-3 sm:px-6">
            <p className="text-xs text-muted-foreground">
              {room > 0
                ? `You can add ${room} more to this product.`
                : "This product already has the maximum number of datasheets."}
            </p>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                disabled={selected.length === 0}
                onClick={() => {
                  onAdd(
                    selected.map((url) => ({
                      url,
                      fileName: items?.find((i) => i.url === url)?.fileName ?? "",
                    })),
                  );
                  onOpenChange(false);
                }}
              >
                Add selected{selected.length ? ` (${selected.length})` : ""}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </>
  );
}
