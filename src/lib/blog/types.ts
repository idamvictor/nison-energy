// Blog view types + admin write shapes — safe to import from client components.
// The persisted shape is `Post` in prisma/schema.prisma; src/lib/blog/queries.ts
// maps a row to the view types below.

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  author: string;
  publishedAt: string; // date-only ISO string, e.g. "2026-06-09"
  tags: string[];
  bodyHtml: string; // sanitised HTML from the Tiptap editor
  published?: boolean;
};

// ─── Admin ─────────────────────────────────────────────────────────────────

/** Compact row for the admin blog table. */
export type AdminPostRow = {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  tags: string[];
  published: boolean;
  publishedAt: string;
};

/** The admin write shape — one flat object with every editable field. */
export type PostInput = {
  title: string;
  excerpt: string;
  coverImage: string;
  author: string;
  tags: string[];
  bodyHtml: string;
  published: boolean;
  publishedAt: string; // "YYYY-MM-DD"
};

export type WriteResult =
  | { ok: true; id: string }
  | { ok: false; error: string };
