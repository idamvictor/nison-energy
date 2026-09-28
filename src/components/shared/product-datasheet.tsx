import { DatasheetCard } from "@/components/shared/datasheet/datasheet-card";

/** Datasheet tab content — a Drive-style card that opens an in-app preview. */
export function ProductDatasheet({ url }: { url: string }) {
  return <DatasheetCard url={url} />;
}
