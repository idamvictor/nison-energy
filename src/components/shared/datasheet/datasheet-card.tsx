"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  MoreVertical,
  RefreshCw,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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

// Card geometry, shared with the admin's empty drop zone so both take the
// same space: p-2 + h-12 header (two-line name) + gap-2 + h-44 thumbnail.
export const DATASHEET_CARD_WIDTH = "w-[272px] max-w-full";
export const DATASHEET_CARD_HEIGHT = "h-[248px]";
const THUMB_WIDTH = 256;

/**
 * Link that downloads a datasheet: `?download=1` makes the media route send
 * `Content-Disposition: attachment` with the original name, so browsers save
 * the file instead of opening it in a tab.
 */
export function datasheetDownloadUrl(url: string): string {
  return `${url}?download=1`;
}

export function PdfChip() {
  return (
    <span className="flex h-5 shrink-0 items-center rounded-[5px] bg-red-600 px-1 text-[10px] font-bold tracking-wide text-white">
      PDF
    </span>
  );
}

/**
 * Google-Drive-style datasheet tile: name over a page-1 thumbnail. Clicking
 * it downloads the PDF (no in-app viewer). Admin actions add a ⋮ menu.
 */
export function DatasheetCard({
  url,
  name: displayName,
  onReplace,
  onRemove,
  onMoveLeft,
  onMoveRight,
}: {
  url: string;
  /** Original file name to show (defaults to the web-safe name in the URL). */
  name?: string;
  /** Admin-only actions — omit on the storefront. */
  onReplace?: () => void;
  onRemove?: () => void;
  /** Admin reordering — omit at the ends of the list. */
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
}) {
  const name = displayName ?? datasheetFileName(url);
  const downloadUrl = datasheetDownloadUrl(url);
  // Pre-rendered page-1 image (uploaded with the PDF) — instant, and avoids
  // fetching the PDF just for the thumbnail. A missing image falls back to
  // rendering page 1 with pdf.js.
  const previewUrl = datasheetPreviewUrl(url);
  const [previewFailed, setPreviewFailed] = useState(false);
  const isAdmin = Boolean(onReplace || onRemove || onMoveLeft || onMoveRight);

  const cardClass = `group flex flex-col gap-2 rounded-2xl bg-muted p-2 ring-1 ring-border transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-foreground/15 ${DATASHEET_CARD_WIDTH} ${DATASHEET_CARD_HEIGHT}`;
  const thumbClass =
    "relative block h-44 w-full overflow-hidden rounded-xl bg-white ring-1 ring-border/70";
  const nameLine = (
    <p
      className="line-clamp-2 min-w-0 flex-1 text-sm leading-tight font-medium wrap-break-word text-foreground"
      title={name}
    >
      {name}
    </p>
  );
  const thumbnail = (
    <>
      {previewUrl && !previewFailed ? (
        // eslint-disable-next-line @next/next/no-img-element -- already sized for the card; skip the optimizer round-trip
        <img
          src={previewUrl}
          alt=""
          width={THUMB_WIDTH}
          height={176}
          onError={() => setPreviewFailed(true)}
          className="size-full object-cover object-top"
        />
      ) : (
        <PdfFirstPage url={url} width={THUMB_WIDTH} />
      )}
      {/* Hover/focus hint: clicking downloads. */}
      <span className="absolute inset-0 flex items-center justify-center bg-foreground/0 opacity-0 transition-all duration-200 group-hover:bg-foreground/35 group-hover:opacity-100 group-focus-visible:bg-foreground/35 group-focus-visible:opacity-100 group-focus-within:bg-foreground/35 group-focus-within:opacity-100 motion-reduce:transition-none">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-sm font-semibold text-foreground shadow-md">
          <Download className="size-4" />
          Download PDF
        </span>
      </span>
    </>
  );

  // Storefront: the whole card is one download link.
  if (!isAdmin) {
    return (
      <a
        href={downloadUrl}
        download={name}
        aria-label={`Download ${name}`}
        className={`${cardClass} focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none`}
      >
        <span className="flex h-12 items-center gap-2 pl-1.5">
          <PdfChip />
          {nameLine}
          <Download aria-hidden className="mr-1.5 size-4 shrink-0 text-muted-foreground" />
        </span>
        <span className={thumbClass}>{thumbnail}</span>
      </a>
    );
  }

  // Admin: the ⋮ menu (download, reorder, replace, remove) + a downloadable thumbnail.
  return (
    <div className={cardClass}>
      <div className="flex h-12 items-center gap-2 pl-1.5">
        <PdfChip />
        {nameLine}
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
            <DropdownMenuItem render={<a href={downloadUrl} download={name} />}>
              <Download />
              Download
            </DropdownMenuItem>
            {onMoveLeft && (
              <DropdownMenuItem onClick={onMoveLeft}>
                <ArrowLeft />
                Move left
              </DropdownMenuItem>
            )}
            {onMoveRight && (
              <DropdownMenuItem onClick={onMoveRight}>
                <ArrowRight />
                Move right
              </DropdownMenuItem>
            )}
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
      <a
        href={downloadUrl}
        download={name}
        aria-label={`Download ${name}`}
        className={`${thumbClass} focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none`}
      >
        {thumbnail}
      </a>
    </div>
  );
}
