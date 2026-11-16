"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { renderTemplatesForDownload } from "@/lib/email/template-actions";
import { downloadEmailsPdf } from "@/components/admin/email-templates/download-email-pdf";

/** Download one template (every version of it) or, with no key, all of them, as a PDF. */
export function DownloadPdfButton({
  templateKey,
  label = "Download PDF",
  variant = "outline",
  size = "sm",
}: {
  templateKey?: string;
  label?: string;
  variant?: "outline" | "default" | "ghost";
  size?: "sm" | "default";
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function download() {
    setBusy(true);
    setError(null);
    try {
      const result = await renderTemplatesForDownload(templateKey);
      if (!result.ok) throw new Error(result.error);
      await downloadEmailsPdf(result.emails, `ocunio-email-${templateKey ?? "templates"}.pdf`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create the PDF.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <Button type="button" variant={variant} size={size} onClick={download} disabled={busy}>
        {busy ? <Loader2 className="animate-spin" /> : <Download />}
        {busy ? "Preparing…" : label}
      </Button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </span>
  );
}
