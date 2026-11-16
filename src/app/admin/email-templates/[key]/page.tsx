import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EmailTemplateEditor } from "@/components/admin/email-templates/email-template-editor";
import { requirePermission } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { defaultCopy, getTemplateDef, GLOBAL_PLACEHOLDERS } from "@/lib/email/template-registry";
import { getTemplateCopy, getTemplateOverrides } from "@/lib/email/template-copy";
import { renderSample, variantsFor } from "@/lib/email/template-samples";

export async function generateMetadata({ params }: { params: Promise<{ key: string }> }): Promise<Metadata> {
  const { key } = await params;
  const def = getTemplateDef(key);
  return { title: def ? `${def.label} email | Admin` : "Email template | Admin" };
}

export default async function EmailTemplatePage({ params }: { params: Promise<{ key: string }> }) {
  const user = await requirePermission("emails.view");
  const { key } = await params;
  const def = getTemplateDef(key);
  if (!def) notFound();

  const [copy, overrides] = await Promise.all([getTemplateCopy(key), getTemplateOverrides()]);
  const variants = variantsFor(key);
  const preview = await renderSample(key, variants[0].id, copy);
  const saved = overrides[key];

  return (
    <EmailTemplateEditor
      def={def}
      globals={GLOBAL_PLACEHOLDERS}
      initialCopy={copy}
      defaults={defaultCopy(key)}
      variants={variants}
      initialPreview={preview}
      canEdit={can(user.role, "emails.edit")}
      savedAt={saved?.updatedAt ?? null}
      savedBy={saved?.updatedBy ?? null}
    />
  );
}
