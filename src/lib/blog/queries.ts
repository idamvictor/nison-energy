import "server-only";

import { cache } from "react";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { cleanBodyHtml, htmlToText } from "@/lib/blog/sanitize";
import type { Post as PostRow } from "@/generated/prisma/client";
import type {
  AdminPostRow,
  BlogPost,
  PostInput,
  WriteResult,
} from "@/lib/blog/types";

// ─── Row → view-type mappers ───────────────────────────────────────────────

export function dbToPost(row: PostRow): BlogPost {
  return {
    slug: row.id,
    title: row.title,
    excerpt: row.excerpt,
    coverImage: row.coverImage,
    author: row.author,
    publishedAt: row.publishedAt.toISOString().slice(0, 10),
    tags: row.tags,
    bodyHtml: row.bodyHtml,
    published: row.published,
  };
}

export function toAdminRow(row: PostRow): AdminPostRow {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    coverImage: row.coverImage,
    tags: row.tags,
    published: row.published,
    publishedAt: row.publishedAt.toISOString().slice(0, 10),
  };
}

// ─── Storefront reads (published only) ─────────────────────────────────────

export const getPublishedPosts = cache(async (): Promise<BlogPost[]> => {
  const rows = await prisma.post.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  });
  return rows.map(dbToPost);
});

export const getLatestPosts = cache(async (limit: number): Promise<BlogPost[]> => {
  const rows = await prisma.post.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
  return rows.map(dbToPost);
});

export const getPostBySlug = cache(async (id: string): Promise<BlogPost | null> => {
  const row = await prisma.post.findUnique({ where: { id } });
  return row && row.published ? dbToPost(row) : null;
});

// ─── Admin reads (any state) ──────────────────────────────────────────────

export const getPostRow = cache((id: string) =>
  prisma.post.findUnique({ where: { id } }),
);

export const getAllPosts = cache((): Promise<PostRow[]> =>
  prisma.post.findMany({ orderBy: { publishedAt: "desc" } }),
);

// ─── Writes ───────────────────────────────────────────────────────────────

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function validate(input: PostInput): string | null {
  if (!input.title.trim()) return "Title is required.";
  if (!input.excerpt.trim()) return "An excerpt is required.";
  if (!input.coverImage.trim()) return "A cover image URL is required.";
  if (!htmlToText(input.bodyHtml)) return "The article body is empty.";
  if (Number.isNaN(Date.parse(input.publishedAt)))
    return "A valid published date is required.";
  return null;
}

function toData(input: PostInput) {
  return {
    title: input.title.trim(),
    excerpt: input.excerpt.trim(),
    coverImage: input.coverImage.trim(),
    author: input.author.trim() || "Ocunio Energy",
    tags: input.tags,
    bodyHtml: cleanBodyHtml(input.bodyHtml),
    published: input.published,
    publishedAt: new Date(input.publishedAt),
  };
}

export async function createPost(
  slug: string,
  input: PostInput,
): Promise<WriteResult> {
  await requireAdmin();
  const id = slug.trim().toLowerCase();
  if (!SLUG_RE.test(id)) {
    return { ok: false, error: "Slug must be lowercase words separated by hyphens." };
  }
  const err = validate(input);
  if (err) return { ok: false, error: err };
  if (await prisma.post.findUnique({ where: { id }, select: { id: true } })) {
    return { ok: false, error: `An article with slug "${id}" already exists.` };
  }
  await prisma.post.create({ data: { id, ...toData(input) } });
  return { ok: true, id };
}

export async function updatePost(
  id: string,
  input: PostInput,
): Promise<WriteResult> {
  await requireAdmin();
  const err = validate(input);
  if (err) return { ok: false, error: err };
  await prisma.post.update({ where: { id }, data: toData(input) });
  return { ok: true, id };
}

export async function deletePost(id: string): Promise<WriteResult> {
  await requireAdmin();
  await prisma.post.delete({ where: { id } });
  return { ok: true, id };
}
