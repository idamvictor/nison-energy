import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Mail } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { DownloadPdfButton } from "@/components/admin/email-templates/download-button";
import { requirePermission } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { EMAIL_TEMPLATES, type TemplateGroup } from "@/lib/email/template-registry";
import { getTemplateOverrides } from "@/lib/email/template-copy";

export const metadata: Metadata = { title: "Email templates | Admin" };

const GROUPS: TemplateGroup[] = ["Account", "Enquiries", "Orders", "Quotes"];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default async function EmailTemplatesPage() {
  const user = await requirePermission("emails.view");
  const canEdit = can(user.role, "emails.edit");
  const overrides = await getTemplateOverrides();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Mail className="size-5" />
          </span>
          <div>
            <h2 className="font-heading text-base font-semibold text-foreground">Email templates</h2>
            <p className="text-sm text-muted-foreground">
              The {EMAIL_TEMPLATES.length} emails customers receive.{" "}
              {canEdit ? "Open one to edit its wording." : "View only — the Super admin edits these."}
            </p>
          </div>
        </div>
        <DownloadPdfButton label="Download all (PDF)" variant="default" size="default" />
      </div>

      {GROUPS.map((group) => (
        <section key={group} className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{group}</h3>
          <div className="overflow-hidden rounded-xl border border-border">
            {EMAIL_TEMPLATES.filter((t) => t.group === group).map((t, i) => {
              const edited = overrides[t.key];
              const subject = edited?.fields.subject ?? t.fields.find((f) => f.id === "subject")!.default;
              return (
                <div
                  key={t.key}
                  className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between ${i > 0 ? "border-t border-border" : ""}`}
                >
                  <Link href={`/admin/email-templates/${t.key}`} className="group min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-foreground group-hover:text-primary-ink">{t.label}</span>
                      {edited ? (
                        <Badge variant="secondary" className="bg-primary/10 text-primary-ink">
                          Edited {formatDate(edited.updatedAt)}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Default</Badge>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">Subject: {subject}</p>
                    <p className="text-xs text-muted-foreground">Sent when: {t.trigger}</p>
                  </Link>
                  <div className="flex shrink-0 items-center gap-2">
                    <DownloadPdfButton templateKey={t.key} />
                    <Link
                      href={`/admin/email-templates/${t.key}`}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-sm font-medium text-foreground hover:bg-secondary"
                    >
                      {canEdit ? "Edit" : "View"}
                      <ChevronRight className="size-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
