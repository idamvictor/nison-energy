"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Newspaper, Plus, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BlogPostTable } from "@/components/admin/blog/blog-post-table";
import { useBlogPosts } from "@/hooks/use-blog-posts";

export function BlogPostsPage() {
  const posts = useBlogPosts((s) => s.posts);
  const [query, setQuery] = useState("");

  const sorted = [...posts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const filtered = sorted.filter((post) => {
    if (query.trim() === "") return true;
    const q = query.toLowerCase();
    return post.title.toLowerCase().includes(q) || post.author.toLowerCase().includes(q);
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Newspaper className="size-5" />
          </span>
          <div>
            <h2 className="font-heading text-base font-semibold text-foreground">Blog</h2>
            <p className="text-sm text-muted-foreground">{posts.length} articles</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" nativeButton={false} render={<Link href="/blog" target="_blank" />}>
            <ArrowUpRight />
            View blog
          </Button>
          <Button nativeButton={false} render={<Link href="/admin/blog/new" />}>
            <Plus />
            Add post
          </Button>
        </div>
      </div>

      <div className="relative w-full sm:w-72">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search articles…"
          className="pl-8"
        />
      </div>

      <BlogPostTable items={filtered} />
    </div>
  );
}
