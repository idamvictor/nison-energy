"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Download, Eye, MoreVertical, RefreshCw, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { datasheetFileName, datasheetPreviewUrl } from "@/lib/media/datasheet";

const PdfFirstPage = dynamic(
  () => import("./pdf-pages").then((m) => m.PdfFirstPage),
  { ssr: false, loading: () => <Skeleton className="size-full rounded-none" /> },
);
const PdfAllPages = dynamic(
  () => import("./pdf-pages").then((m) => m.PdfAllPages),
  { ssr: false },
);

// Card geometry, shared with the admin's empty drop zone so both take the
// same space: p-2 + h-8 header + gap-2 + h-48 thumbnail.
export const DATASHEET_CARD_WIDTH = "w-[272px] max-w-full";
export const DATASHEET_CARD_HEIGHT = "h-[248px]";
const THUMB_WIDTH = 256;

function PdfChip() {
  return (
    <span className="flex h-5 shrink-0 items-center rounded-[5px] bg-red-600 px-1 text-[10px] font-bold tracking-wide text-white">
      PDF
    </span>
  );
}

/**
 * Google-Drive-style datasheet tile: name + menu over a page-1 thumbnail.
 * Clicking opens an in-app preview rendered with pdf.js, so it never depends
 * on (or gets hijacked into a download by) the browser's own PDF viewer.
 */
export function DatasheetCard({
  url,
  onReplace,
  onRemove,
}: {
  url: string;
  /** Admin-only actions — omit on the storefront. */
  onReplace?: () => void;
  onRemove?: () => void;
}) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const name = datasheetFileName(url);
  // Pre-rendered page-1 image (uploaded with the PDF) — instant, and avoids
  // downloading the whole PDF just for the thumbnail. Legacy uploads have
  // none, and a missing image falls back to rendering the PDF.
  const previewUrl = datasheetPreviewUrl(url);
  const [previewFailed, setPreviewFailed] = useState(false);

  return (
    <>
      <div
        className={`group flex flex-col gap-2 rounded-2xl bg-muted p-2 ring-1 ring-border transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-foreground/15 ${DATASHEET_CARD_WIDTH} ${DATASHEET_CARD_HEIGHT}`}
      >
        <div className="flex h-8 items-center gap-2 pl-1.5">
          <PdfChip />
          <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground" title={name}>
            {name}
          </p>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Datasheet options"
                  className="rounded-full text-muted-foreground"
                />
              }
            >
              <MoreVertical />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setPreviewOpen(true)}>
                <Eye />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem render={<a href={url} download={name} />}>
                <Download />
                Download
              </DropdownMenuItem>
              {onReplace && (
                <DropdownMenuItem onClick={onReplace}>
                  <RefreshCw />
                  Replace
                </DropdownMenuItem>
              )}
              {onRemove && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={onRemove}>
                    <Trash2 />
                    Remove
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          aria-label={`Preview ${name}`}
          className="relative h-48 w-full overflow-hidden rounded-xl bg-white ring-1 ring-border/70 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          {previewUrl && !previewFailed ? (
            // eslint-disable-next-line @next/next/no-img-element -- already sized for the card; skip the optimizer round-trip
            <img
              src={previewUrl}
              alt=""
              width={THUMB_WIDTH}
              height={192}
              onError={() => setPreviewFailed(true)}
              className="size-full object-cover object-top"
            />
          ) : (
            <PdfFirstPage url={url} width={THUMB_WIDTH} />
          )}
        </button>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent
          showCloseButton={false}
          className="flex h-[92svh] flex-col gap-0 overflow-hidden bg-neutral-900 p-0 text-white ring-white/10 sm:max-w-5xl"
        >
          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
            <PdfChip />
            <div className="min-w-0 flex-1">
              <DialogTitle className="truncate text-sm font-medium text-white">
                {name}
              </DialogTitle>
              {pageCount !== null && (
                <p className="text-xs text-white/50">
                  {pageCount} {pageCount === 1 ? "page" : "pages"}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<a href={url} download={name} />}
              className="text-white/80 hover:bg-white/10 hover:text-white"
            >
              <Download />
              Download
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Close preview"
              onClick={() => setPreviewOpen(false)}
              className="text-white/80 hover:bg-white/10 hover:text-white"
            >
              <X />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto bg-neutral-800 px-3 py-5 sm:px-8">
            {previewOpen && <PdfAllPages url={url} onPageCount={setPageCount} />}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
