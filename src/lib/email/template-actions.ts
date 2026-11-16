"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { prisma } from "@/lib/db";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { checkPermission, NOT_ALLOWED } from "@/lib/auth/session";
import {
  EMAIL_TEMPLATES,
  defaultCopy,
  getTemplateDef,
  unknownPlaceholders,
  type TemplateCopy,
} from "@/lib/email/template-registry";
import { cleanFields, getTemplateCopy } from "@/lib/email/template-copy";
import { renderSample, variantsFor } from "@/lib/email/template-samples";

export type RenderedEmail = { key: string; label: string; variant: string; subject: string; html: string };
type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

/** Validate an editor's fields; returns an error message or the cleaned copy. */
function validate(key: string, fields: TemplateCopy): { error: string } | { copy: TemplateCopy } {
  const def = getTemplateDef(key);
  if (!def) return { error: "Unknown email template." };
  const copy: TemplateCopy = {};
  for (const field of def.fields) {
    const text = (fields[field.id] ?? "").replace(/\r\n/g, "\n");
    if (!text.trim()) return { error: `“${field.label}” can't be empty.` };
    if (text.length > 4000) return { error: `“${field.label}” is too long.` };
    if (field.plain && text.includes("\n")) return { error: `“${field.label}” must be a single line.` };
    const unknown = unknownPlaceholders(def, text);
    if (unknown.length) {
      return { error: `“${field.label}” uses ${unknown.map((u) => `{${u}}`).join(", ")}, which this email doesn't have.` };
    }
    copy[field.id] = text;
  }
  return { copy };
}

/** Live preview of a template with example data — the saved wording, or the editor's unsaved draft. */
export async function previewEmailTemplate(
  key: string,
  variant: string,
  draft?: TemplateCopy,
): Promise<Result<{ subject: string; html: string }>> {
  if (!(await checkPermission("emails.view"))) return { ok: false, error: NOT_ALLOWED };
  if (!getTemplateDef(key)) return { ok: false, error: "Unknown email template." };
  let copy = await getTemplateCopy(key);
  if (draft) {
    const checked = validate(key, draft);
    if ("error" in checked) return { ok: false, error: checked.error };
    copy = checked.copy;
  }
  const { subject, html } = await renderSample(key, variant, copy);
  return { ok: true, subject, html };
}

/** Every version of one template (or of all of them) as sent today — for the PDF download. */
export async function renderTemplatesForDownload(key?: string): Promise<Result<{ emails: RenderedEmail[] }>> {
  if (!(await checkPermission("emails.view"))) return { ok: false, error: NOT_ALLOWED };
  const defs = key ? EMAIL_TEMPLATES.filter((t) => t.key === key) : EMAIL_TEMPLATES;
  if (!defs.length) return { ok: false, error: "Unknown email template." };
  const emails: RenderedEmail[] = [];
  for (const def of defs) {
    const copy = await getTemplateCopy(def.key);
    for (const v of variantsFor(def.key)) {
      const { subject, html } = await renderSample(def.key, v.id, copy);
      emails.push({ key: def.key, label: def.label, variant: v.label, subject, html });
    }
  }
  return { ok: true, emails };
}

function refresh(key: string) {
  revalidateTag(CACHE_TAGS.emailTemplates, { expire: 0 });
  revalidatePath("/admin/email-templates");
  revalidatePath(`/admin/email-templates/${key}`);
}

/** Save a template's wording (Super admin only). Only fields that differ from the default are stored. */
export async function saveEmailTemplate(key: string, fields: TemplateCopy): Promise<Result> {
  const user = await checkPermission("emails.edit");
  if (!user) return { ok: false, error: NOT_ALLOWED };
  const checked = validate(key, fields);
  if ("error" in checked) return { ok: false, error: checked.error };

  const defaults = defaultCopy(key);
  const changed = cleanFields(
    key,
    Object.fromEntries(Object.entries(checked.copy).filter(([id, text]) => text !== defaults[id])),
  );
  if (Object.keys(changed).length === 0) {
    await prisma.emailTemplate.deleteMany({ where: { key } });
  } else {
    await prisma.emailTemplate.upsert({
      where: { key },
      create: { key, fields: changed, updatedBy: user.email },
      update: { fields: changed, updatedBy: user.email },
    });
  }
  refresh(key);
  return { ok: true };
}

/** Put a template back to its original wording (Super admin only). */
export async function resetEmailTemplate(key: string): Promise<Result> {
  if (!(await checkPermission("emails.edit"))) return { ok: false, error: NOT_ALLOWED };
  if (!getTemplateDef(key)) return { ok: false, error: "Unknown email template." };
  await prisma.emailTemplate.deleteMany({ where: { key } });
  refresh(key);
  return { ok: true };
}
