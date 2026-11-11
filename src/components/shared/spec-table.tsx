import { Fragment } from "react";

import type { Spec } from "@/lib/catalog/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

/** Separator for extra columns in a spec value ("3-core 4.0mm², SWA | 15.0mm"). */
const COLUMN_SEPARATOR = " | ";

type Block = { section?: string; rows: Spec[]; columns: boolean };

/**
 * Split the rows into runs of the same section. A section whose every row has
 * a " | " value (and at least 2 rows) is a multi-column table: its first row
 * holds the column headings, e.g. Cable Code | Cable Description | Approx. OD.
 * This keeps the table editable as plain label/value rows in the admin.
 */
function toBlocks(specs: Spec[]): Block[] {
  const blocks: Block[] = [];
  for (const spec of specs) {
    const last = blocks.at(-1);
    if (last && last.section === spec.section) last.rows.push(spec);
    else blocks.push({ section: spec.section, rows: [spec], columns: false });
  }
  for (const b of blocks) {
    b.columns = !!b.section && b.rows.length >= 2 && b.rows.every((r) => r.value.includes(COLUMN_SEPARATOR));
  }
  return blocks;
}

const cellsOf = (spec: Spec) => [spec.label, ...spec.value.split(COLUMN_SEPARATOR).map((v) => v.trim())];

/**
 * Product specification table. Rows with a `section` are grouped under a
 * heading row whenever the section changes (e.g. Kit → Panel → Microinverter);
 * rows without one render as a plain list, as on the charger pages.
 */
export function SpecTable({ specs }: { specs: Spec[] }) {
  const blocks = toBlocks(specs);
  const plain = blocks.filter((b) => !b.columns);
  const tables = blocks.filter((b) => b.columns);

  return (
    <div className="flex flex-col gap-6">
      {plain.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow className="bg-secondary/60 hover:bg-secondary/60">
                <TableHead className="w-2/5">Specification</TableHead>
                <TableHead>
                  <span className="sr-only">Value</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plain.map((block, b) => (
                <Fragment key={`${block.section ?? ""}::${b}`}>
                  {block.section && (
                    <TableRow className="bg-secondary/40 hover:bg-secondary/40">
                      <TableCell
                        colSpan={2}
                        className="text-xs font-semibold tracking-wide whitespace-normal text-primary-ink uppercase"
                      >
                        {block.section}
                      </TableCell>
                    </TableRow>
                  )}
                  {block.rows.map((spec, i) => (
                    <TableRow key={`${spec.label}::${i}`}>
                      <TableCell className="whitespace-normal wrap-break-word text-muted-foreground">
                        {spec.label}
                      </TableCell>
                      <TableCell className="font-medium whitespace-normal wrap-break-word text-foreground">
                        {spec.value}
                      </TableCell>
                    </TableRow>
                  ))}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {tables.map((block, b) => {
        const [head, ...rows] = block.rows.map(cellsOf);
        return (
          <div key={`${block.section}::${b}`}>
            <h3 className="mb-3 text-base font-semibold text-foreground">{block.section}</h3>
            <div className="overflow-x-auto rounded-xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/60 hover:bg-secondary/60">
                    {head.map((cell, i) => (
                      <TableHead key={i}>{cell}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((cells, r) => (
                    <TableRow key={r}>
                      {head.map((_, i) => (
                        <TableCell
                          key={i}
                          className={i === 0 ? "font-medium text-foreground" : "whitespace-normal text-muted-foreground"}
                        >
                          {cells[i] ?? ""}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
