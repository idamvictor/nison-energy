"use client";

import { Plus, X } from "lucide-react";

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
    onChange(rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }
  function removeRow(index: number) {
    onChange(rows.length > 1 ? rows.filter((_, i) => i !== index) : rows);
  }
  function addRow() {
    onChange([...rows, { desc: "", cost: "" }]);
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div>
        <p className="text-sm font-medium text-foreground">Additional works (optional)</p>
        <p className="text-xs text-muted-foreground">
          e.g. mounting/pedestal, electrical protection hardware, civil works,
          cabling — add as many lines as you need
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {rows.map((row, index) => (
          <div key={index} className="grid grid-cols-[2.2fr_1fr_auto] items-center gap-2">
            <Input
              placeholder="e.g. cabling, groundworks, pedestal mounting"
              value={row.desc}
              onChange={(e) => updateRow(index, { desc: e.target.value })}
            />
            <Input
              placeholder="£ ex VAT"
              value={row.cost}
              onChange={(e) => updateRow(index, { cost: e.target.value })}
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
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="w-fit gap-1.5 text-primary hover:text-primary"
        onClick={addRow}
      >
        <Plus className="size-3.5" />
        Add another item
      </Button>
    </div>
  );
}
