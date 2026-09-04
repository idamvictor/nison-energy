"use client";

import { X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type WorkRow = { desc: string; cost: string };

export function WorksRowsField({
  rows,
  onChange,
}: {
  rows: WorkRow[];
  onChange: (rows: WorkRow[]) => void;
}) {
  function updateRow(index: number, patch: Partial<WorkRow>) {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function removeRow(index: number) {
    onChange(rows.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-col gap-0.5">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Additional works
        </p>
        <p className="text-xs text-muted-foreground">
          e.g. mounting/pedestal, electrical protection hardware, civil
          works, cabling — add as many lines as you need
        </p>
      </div>

      {rows.map((row, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            value={row.desc}
            onChange={(e) => updateRow(index, { desc: e.target.value })}
            placeholder="e.g. cabling, groundworks, pedestal mounting"
            className="flex-[2.2]"
          />
          <Input
            value={row.cost}
            onChange={(e) => updateRow(index, { cost: e.target.value })}
            placeholder="£ ex VAT"
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0 text-muted-foreground hover:text-destructive"
            onClick={() => removeRow(index)}
          >
            <X className="size-4" />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-fit"
        onClick={() => onChange([...rows, { desc: "", cost: "" }])}
      >
        + Add another item
      </Button>
    </div>
  );
}
