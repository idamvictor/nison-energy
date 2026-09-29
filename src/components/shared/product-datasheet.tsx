import { DatasheetCard } from "@/components/shared/datasheet/datasheet-card";

/**
 * Datasheet tab content — every datasheet for the product, side by side as
 * Drive-style cards (admin order). Each opens its own in-app preview.
 */
export function ProductDatasheet({ urls }: { urls: string[] }) {
  return (
    <div className="flex flex-wrap gap-4">
      {urls.map((url) => (
        <DatasheetCard key={url} url={url} />
      ))}
    </div>
  );
}
