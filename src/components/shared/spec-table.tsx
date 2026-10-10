import { Fragment } from "react";

import type { Spec } from "@/lib/catalog/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

/**
 * Product specification table. Rows with a `section` are grouped under a
 * heading row whenever the section changes (e.g. Kit → Panel → Microinverter);
 * rows without one render as a plain list, as on the charger pages.
 */
export function SpecTable({ specs }: { specs: Spec[] }) {
  return (
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
          {specs.map((spec, i) => {
            const newSection = spec.section && spec.section !== specs[i - 1]?.section;
            return (
              <Fragment key={`${spec.section ?? ""}::${spec.label}::${i}`}>
                {newSection && (
                  <TableRow className="bg-secondary/40 hover:bg-secondary/40">
                    <TableCell
                      colSpan={2}
                      className="text-xs font-semibold tracking-wide whitespace-normal text-primary-ink uppercase"
                    >
                      {spec.section}
                    </TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableCell className="whitespace-normal wrap-break-word text-muted-foreground">
                    {spec.label}
                  </TableCell>
                  <TableCell className="font-medium whitespace-normal wrap-break-word text-foreground">
                    {spec.value}
                  </TableCell>
                </TableRow>
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
