"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Loader2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// How many thumbnails render (and therefore actually fetch) at a time —
// the full URL list can be a couple hundred long, but nothing past this
// count gets an <Image> mounted until the sentinel below the grid scrolls
// into view and reveals the next batch.
const BATCH_SIZE = 24;

/**
 * "File manager" popup for picking an image already used somewhere in the
 * catalogue/blog (GET /api/media/library), or uploading a new one from this
 * device without leaving the dialog (POST /api/media — same upload endpoint
 * ImageUploadField's own Link tab doesn't touch).
 */
export function MediaLibraryDialog({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
}) {
  const [urls, setUrls] = useState<string[] | null>(null);
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loading = open && urls === null && !error;
  const hasMore = !!urls && visibleCount < urls.length;

  // Infinite scroll: reveal the next batch once the sentinel at the bottom
  // of the grid comes into view within the dialog's own scroll container —
  // the full url list is already in memory, so "loading more" just mounts
  // more <Image>s rather than an actual network fetch.
  useEffect(() => {
    if (!open || !hasMore) return;
    const root = scrollRef.current;
    const sentinel = sentinelRef.current;
    if (!root || !sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((c) => c + BATCH_SIZE);
        }
      },
      { root, rootMargin: "200px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [open, hasMore, visibleCount]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    fetch("/api/media/library")
      .then((res) => res.json())
      .then((data: { urls?: string[]; error?: string }) => {
        if (cancelled) return;
        if (data.urls) {
          setUrls(data.urls);
          setVisibleCount(BATCH_SIZE);
        } else {
          setError(data.error ?? "Failed to load media library.");
        }
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load media library.");
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/media", { method: "POST", body: formData });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Upload failed.");
        return;
      }
      onSelect(data.url);
      onOpenChange(false);
    } catch {
      setError("Upload failed. Check your connection and try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const visibleUrls = urls?.slice(0, visibleCount) ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Media library</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            hidden
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="w-fit"
          >
            {uploading ? <Loader2 className="animate-spin" /> : <Upload />}
            {uploading ? "Uploading…" : "Upload new image"}
          </Button>
          {urls && urls.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Showing {visibleUrls.length} of {urls.length}
            </p>
          )}
          {error && <p className="text-xs font-medium text-destructive">{error}</p>}
        </div>

        <div ref={scrollRef} className="max-h-128 overflow-y-auto pr-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
              Loading…
            </div>
          ) : urls && urls.length > 0 ? (
            <>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                {visibleUrls.map((url) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => {
                      onSelect(url);
                      onOpenChange(false);
                    }}
                    className="group relative aspect-square overflow-hidden rounded-xl bg-secondary ring-1 ring-border transition-all hover:ring-2 hover:ring-primary"
                  >
                    <Image
                      src={url}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 180px, (min-width: 640px) 220px, 33vw"
                      loading="lazy"
                      className="object-cover transition-transform duration-150 group-hover:scale-105"
                    />
                  </button>
                ))}
              </div>
              {hasMore && (
                <div
                  ref={sentinelRef}
                  className="mt-4 flex justify-center py-4"
                >
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </>
          ) : (
            <p className="py-16 text-center text-sm text-muted-foreground">
              No images yet — upload one above.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
