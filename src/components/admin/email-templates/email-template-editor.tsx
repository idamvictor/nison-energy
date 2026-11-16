"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Info, Lock, Monitor, RotateCcw, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DownloadPdfButton } from "@/components/admin/email-templates/download-button";
import { previewEmailTemplate, resetEmailTemplate, saveEmailTemplate } from "@/lib/email/template-actions";
import type { TemplateCopy, TemplateDef, TemplatePlaceholder } from "@/lib/email/template-registry";
import type { PreviewVariant } from "@/lib/email/template-samples";
import { cn } from "@/lib/utils";

type Preview = { subject: string; html: string };

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function EmailTemplateEditor({
  def,
  globals,
  initialCopy,
  defaults,
  variants,
  initialPreview,
  canEdit,
  savedAt,
  savedBy,
}: {
  def: TemplateDef;
  globals: TemplatePlaceholder[];
  initialCopy: TemplateCopy;
  defaults: TemplateCopy;
  variants: PreviewVariant[];
  initialPreview: Preview;
  canEdit: boolean;
  savedAt: string | null;
  savedBy: string | null;
}) {
  const router = useRouter();
  const [fields, setFields] = useState<TemplateCopy>(initialCopy);
  const [saved, setSaved] = useState<TemplateCopy>(initialCopy);
  const [variant, setVariant] = useState(variants[0].id);
  const [preview, setPreview] = useState<Preview>(initialPreview);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [width, setWidth] = useState<"desktop" | "mobile">("desktop");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const lastFocused = useRef<{ id: string; el: HTMLInputElement | HTMLTextAreaElement } | null>(null);
  const firstRender = useRef(true);

  const dirty = def.fields.some((f) => fields[f.id] !== saved[f.id]);
  const placeholders = [...def.placeholders, ...globals];

  // Live preview: re-render (debounced) whenever the wording or version changes.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const id = window.setTimeout(async () => {
      const result = await previewEmailTemplate(def.key, variant, fields);
      if (result.ok) {
        setPreview({ subject: result.subject, html: result.html });
        setPreviewError(null);
      } else setPreviewError(result.error);
    }, 350);
    return () => window.clearTimeout(id);
  }, [def.key, variant, fields]);

  function setField(id: string, value: string) {
    setFields((f) => ({ ...f, [id]: value }));
    setMessage(null);
  }

  function insertPlaceholder(name: string) {
    const target = lastFocused.current;
    if (!canEdit || !target) return;
    const { id, el } = target;
    const token = `{${name}}`;
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? start;
    setField(id, el.value.slice(0, start) + token + el.value.slice(end));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + token.length, start + token.length);
    });
  }

  function save() {
    startTransition(async () => {
      const result = await saveEmailTemplate(def.key, fields);
      if (result.ok) {
        setSaved(fields);
        setMessage({ ok: true, text: "Saved — customers will get this wording from now on." });
        router.refresh();
      } else setMessage({ ok: false, text: result.error });
    });
  }

  function resetAll() {
    startTransition(async () => {
      const result = await resetEmailTemplate(def.key);
      setResetOpen(false);
      if (result.ok) {
        setFields(defaults);
        setSaved(defaults);
        setMessage({ ok: true, text: "Back to the original wording." });
        router.refresh();
      } else setMessage({ ok: false, text: result.error });
    });
  }

  const editedFromDefault = def.fields.some((f) => saved[f.id] !== defaults[f.id]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/admin/email-templates"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Email templates
          </Link>
          <h2 className="mt-1 font-heading text-lg font-semibold text-foreground">{def.label}</h2>
          <p className="text-sm text-muted-foreground">Sent when: {def.trigger}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {savedAt ? `Last edited ${formatDate(savedAt)}${savedBy ? ` by ${savedBy}` : ""}` : "Using the original wording"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DownloadPdfButton templateKey={def.key} size="default" />
          {canEdit && (
            <>
              {editedFromDefault && (
                <Button variant="ghost" onClick={() => setResetOpen(true)} disabled={pending}>
                  <RotateCcw />
                  Reset to original
                </Button>
              )}
              <Button onClick={save} disabled={!dirty || pending}>
                <Check />
                {pending ? "Saving…" : "Save changes"}
              </Button>
            </>
          )}
        </div>
      </div>

      {message && (
        <p className={cn("rounded-lg px-3 py-2 text-sm", message.ok ? "bg-primary/10 text-primary-ink" : "bg-destructive/10 text-destructive")}>
          {message.text}
        </p>
      )}
      {!canEdit && (
        <p className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm text-muted-foreground">
          <Lock className="size-4 shrink-0" />
          View only — only the Super admin can change email wording.
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {/* Wording */}
        <div className="flex flex-col gap-4">
          {canEdit && (
            <div className="rounded-xl border border-border p-4">
              <p className="text-sm font-medium text-foreground">Insert a placeholder</p>
              <p className="text-xs text-muted-foreground">
                Click a field, then a placeholder — it&apos;s replaced with the customer&apos;s details when the email is sent.
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {placeholders.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    title={p.description}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => insertPlaceholder(p.name)}
                    className="rounded-md border border-border bg-secondary/60 px-2 py-0.5 font-mono text-xs text-foreground hover:border-primary/60 hover:bg-primary/5"
                  >
                    {`{${p.name}}`}
                  </button>
                ))}
              </div>
              <p className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground">
                <Info className="mt-0.5 size-3.5 shrink-0" />
                <span>
                  Formatting: <code>**bold**</code>, <code>*italic*</code>, links as <code>[link text](https://…)</code>, and
                  a new line for a line break.
                </span>
              </p>
            </div>
          )}

          {def.fields.map((f) => {
            const changed = fields[f.id] !== defaults[f.id];
            const common = {
              id: `field-${f.id}`,
              value: fields[f.id] ?? "",
              readOnly: !canEdit,
              onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setField(f.id, e.target.value),
              onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                (lastFocused.current = { id: f.id, el: e.currentTarget }),
            };
            return (
              <div key={f.id} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor={`field-${f.id}`} className="text-sm font-medium text-foreground">
                    {f.label}
                  </label>
                  <div className="flex items-center gap-2">
                    {changed && <Badge variant="secondary" className="bg-primary/10 text-primary-ink">Edited</Badge>}
                    {canEdit && changed && (
                      <button
                        type="button"
                        onClick={() => setField(f.id, defaults[f.id])}
                        className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                      >
                        Use original
                      </button>
                    )}
                  </div>
                </div>
                {f.plain ? <Input {...common} /> : <Textarea {...common} rows={f.multiline ? 3 : 2} />}
              </div>
            );
          })}

          <div className="rounded-xl border border-dashed border-border p-4">
            <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Lock className="size-3.5" />
              Added automatically (not editable)
            </p>
            <ul className="mt-1.5 list-disc pl-5 text-sm text-muted-foreground">
              {def.automatic.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Live preview */}
        <div className="flex flex-col gap-3 xl:sticky xl:top-20 xl:self-start">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-foreground">
              Preview <span className="font-normal text-muted-foreground">— example customer data</span>
            </p>
            <div className="flex items-center gap-2">
              {variants.length > 1 && (
                <select
                  value={variant}
                  onChange={(e) => setVariant(e.target.value)}
                  aria-label="Version to preview"
                  className="h-8 rounded-lg border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {variants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label}
                    </option>
                  ))}
                </select>
              )}
              <div className="flex rounded-lg border border-border p-0.5">
                {(["desktop", "mobile"] as const).map((w) => (
                  <button
                    key={w}
                    type="button"
                    aria-label={`${w} width`}
                    aria-pressed={width === w}
                    onClick={() => setWidth(w)}
                    className={cn("rounded-md p-1.5", width === w ? "bg-secondary text-foreground" : "text-muted-foreground")}
                  >
                    {w === "desktop" ? <Monitor className="size-4" /> : <Smartphone className="size-4" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {previewError && <p className="text-sm text-destructive">{previewError}</p>}
          <div className="overflow-hidden rounded-xl border border-border bg-secondary/40">
            <div className="border-b border-border bg-background px-4 py-2.5 text-sm">
              <span className="text-muted-foreground">Subject: </span>
              <span className="font-medium text-foreground">{preview.subject}</span>
            </div>
            <div className="flex justify-center p-3">
              <iframe
                title={`${def.label} email preview`}
                srcDoc={preview.html}
                sandbox=""
                className="h-[760px] w-full rounded-md bg-white transition-[max-width]"
                style={{ maxWidth: width === "desktop" ? 640 : 375 }}
              />
            </div>
          </div>
        </div>
      </div>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset to the original wording?</DialogTitle>
            <DialogDescription>
              Every edit to the “{def.label}” email is removed and customers get the original text again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button variant="destructive" onClick={resetAll} disabled={pending}>
              Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
