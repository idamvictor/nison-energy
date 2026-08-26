"use client";

import { useState } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Reveal } from "@/components/shared/reveal";
import { BlogCard } from "@/components/blog/blog-card";
import { useBlogPosts } from "@/hooks/use-blog-posts";

export function BlogList() {
  const posts = useBlogPosts((s) => s.posts);
  const [query, setQuery] = useState("");

  const sorted = [...posts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const filtered = sorted.filter((post) => {
    if (query.trim() === "") return true;
    const q = query.toLowerCase();
    return (
      post.title.toLowerCase().includes(q) ||
      post.excerpt.toLowerCase().includes(q) ||
      post.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  });

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles…"
              className="pl-8"
            />
          </div>
        </Reveal>

        {filtered.length === 0 ? (
          <div className="mt-10 flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border py-16 text-center">
            <p className="text-sm font-medium text-foreground">No articles found</p>
            <p className="text-sm text-muted-foreground">Try a different search.</p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((post, index) => (
              <Reveal key={post.slug} delay={(index % 3) * 75}>
                <BlogCard post={post} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
