import "server-only";

import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/db";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { defaultCopy, getTemplateDef, type TemplateCopy } from "@/lib/email/template-registry";

/** Every saved edit, keyed by template (only the fields the admin changed). */
export const getTemplateOverrides = unstable_cache(
  async (): Promise<Record<string, { fields: TemplateCopy; updatedAt: string; updatedBy: string | null }>> => {
    const rows = await prisma.emailTemplate.findMany();
    return Object.fromEntries(
      rows.map((r) => [
        r.key,
        { fields: (r.fields ?? {}) as TemplateCopy, updatedAt: r.updatedAt.toISOString(), updatedBy: r.updatedBy },
      ]),
    );
  },
  ["email-template-overrides"],
  { tags: [CACHE_TAGS.emailTemplates] },
);

/** Only known, non-empty field ids survive (a field removed from the registry is ignored). */
export function cleanFields(key: string, fields: TemplateCopy): TemplateCopy {
  const def = getTemplateDef(key);
  if (!def) return {};
  const ids = new Set(def.fields.map((f) => f.id));
  return Object.fromEntries(Object.entries(fields).filter(([id, text]) => ids.has(id) && typeof text === "string" && text.trim() !== ""));
}

/**
 * A template's wording as it will be sent: the defaults, with the admin's
 * saved edits on top. A database hiccup falls back to the defaults so an
 * email is never blocked.
 */
export async function getTemplateCopy(key: string): Promise<TemplateCopy> {
  const base = defaultCopy(key);
  try {
    const overrides = await getTemplateOverrides();
    return { ...base, ...cleanFields(key, overrides[key]?.fields ?? {}) };
  } catch (err) {
    console.error(`[email] template copy for "${key}" fell back to defaults:`, err);
    return base;
  }
}
