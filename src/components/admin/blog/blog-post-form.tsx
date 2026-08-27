"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBlogPosts } from "@/hooks/use-blog-posts";
import type { BlogPost } from "@/lib/blog-posts";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
      {label}
      {children}
    </label>
  );
}

export function BlogPostForm({ post }: { post?: BlogPost }) {
  const router = useRouter();
  const addPost = useBlogPosts((s) => s.addPost);
  const updatePost = useBlogPosts((s) => s.updatePost);

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(post));

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const finalSlug = slug.trim() || slugify(title);
        const next: BlogPost = {
          slug: finalSlug,
          title,
          excerpt: String(data.get("excerpt") ?? ""),
          coverImage: String(data.get("coverImage") ?? ""),
          author: String(data.get("author") ?? "Ocunio Energy"),
          publishedAt: String(data.get("publishedAt") ?? new Date().toISOString().slice(0, 10)),
          tags: String(data.get("tags") ?? "")
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          bodyMarkdown: String(data.get("bodyMarkdown") ?? ""),
        };

        if (post) {
          updatePost(post.slug, next);
        } else {
          addPost(next);
        }
        router.push("/admin/blog");
      }}
    >
      <Link
        href="/admin/blog"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to blog
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Article details</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Title">
              <Input
                name="title"
                required
                placeholder="Article title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!slugTouched) setSlug(slugify(e.target.value));
                }}
              />
            </Field>
            <Field label="Slug (URL)">
              <Input
                name="slug"
                required
                placeholder="article-title"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(slugify(e.target.value));
                }}
              />
            </Field>
            <Field label="Author">
              <Input name="author" defaultValue={post?.author ?? "Ocunio Energy"} />
            </Field>
            <Field label="Published date">
              <Input
                name="publishedAt"
                type="date"
                defaultValue={post?.publishedAt ?? new Date().toISOString().slice(0, 10)}
                required
              />
            </Field>
            <Field label="Cover image URL">
              <Input
                name="coverImage"
                required
                placeholder="https://…"
                defaultValue={post?.coverImage}
              />
            </Field>
            <Field label="Tags (comma-separated)">
              <Input
                name="tags"
                placeholder="OZEV Grants, Home Charging"
                defaultValue={post?.tags.join(", ")}
              />
            </Field>
            <Field label="Excerpt">
              <Textarea
                name="excerpt"
                rows={2}
                required
                placeholder="One or two sentences shown on the blog listing"
                defaultValue={post?.excerpt}
                className="sm:col-span-2"
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Body (Markdown)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            name="bodyMarkdown"
            required
            rows={20}
            placeholder="## Heading&#10;&#10;Body copy…"
            defaultValue={post?.bodyMarkdown}
            className="font-mono text-xs"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Supports headings (##), bold (**text**), lists, blockquotes (&gt;), tables, and
            links ([text](url)).
          </p>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" size="lg" className="w-fit">
          {post ? "Save changes" : "Publish article"}
        </Button>
      </div>
    </form>
  );
}
