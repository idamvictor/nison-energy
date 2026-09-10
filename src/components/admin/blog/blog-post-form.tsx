"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RichTextEditor } from "@/components/admin/blog/rich-text-editor";
import type { PostInput } from "@/lib/blog/types";
import type { Post as PostRow } from "@/generated/prisma/client";
import { savePost } from "@/lib/blog/actions";

function toCsv(values: string[]): string {
  return values.join(", ");
}
function fromCsv(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
function toDateInput(date: Date | string): string {
  return new Date(date).toISOString().slice(0, 10);
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label
      className={`flex flex-col gap-1.5 text-sm font-medium text-foreground ${className ?? ""}`}
    >
      {label}
      {children}
    </label>
  );
}

export function BlogPostForm({ post }: { post: PostRow | null }) {
  const router = useRouter();
  const isNew = post === null;

  const [slug, setSlug] = useState(post?.id ?? "");
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [title, setTitle] = useState(post?.title ?? "");
  const [author, setAuthor] = useState(post?.author ?? "Ocunio Energy");
  const [publishedAt, setPublishedAt] = useState(
    post ? toDateInput(post.publishedAt) : toDateInput(new Date()),
  );
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? "");
  const [tags, setTags] = useState(toCsv(post?.tags ?? []));
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [bodyHtml, setBodyHtml] = useState(post?.bodyHtml ?? "");
  const [published, setPublished] = useState(post?.published ?? false);

  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const input: PostInput = {
      title,
      excerpt,
      coverImage,
      author,
      tags: fromCsv(tags),
      bodyHtml,
      published,
      publishedAt,
    };

    const finalSlug = (isNew ? slug || slugify(title) : post!.id).trim();

    startTransition(async () => {
      const result = await savePost(finalSlug, isNew, input);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/admin/blog");
      router.refresh();
    });
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/admin/blog"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to blog
        </Link>
        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Article details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Title">
            <Input
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              placeholder="Article title"
            />
          </Field>
          <Field label="Slug (URL)">
            <Input
              required
              disabled={!isNew}
              value={slug}
              onChange={(e) => {
                setSlug(slugify(e.target.value));
                setSlugTouched(true);
              }}
              placeholder="article-title"
            />
          </Field>
          <Field label="Author">
            <Input value={author} onChange={(e) => setAuthor(e.target.value)} />
          </Field>
          <Field label="Published date">
            <Input
              type="date"
              required
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
            />
          </Field>
          <Field label="Cover image URL">
            <Input
              required
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://…"
            />
          </Field>
          <Field label="Tags (comma separated)">
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="OZEV Grants, Home Charging"
            />
          </Field>
          <Field label="Excerpt" className="sm:col-span-2">
            <Textarea
              rows={2}
              required
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="One or two sentences shown on the blog listing and in search results"
            />
          </Field>
          <label className="flex items-center gap-2 pt-1 text-sm font-medium sm:col-span-2">
            <input
              type="checkbox"
              className="size-4 accent-primary"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />
            Published (visible on the blog)
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Body</CardTitle>
        </CardHeader>
        <CardContent>
          <RichTextEditor value={bodyHtml} onChange={setBodyHtml} />
        </CardContent>
      </Card>

      <div className="sticky bottom-0 -mx-4 flex items-center justify-end gap-2 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-sm supports-backdrop-filter:bg-background/80 sm:-mx-6 sm:px-6">
        <Button
          type="button"
          variant="outline"
          nativeButton={false}
          render={<Link href="/admin/blog" />}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : isNew ? "Create article" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
