"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { useBlogPosts } from "@/hooks/use-blog-posts";
import { BlogCard } from "@/components/blog/blog-card";
import { Reveal } from "@/components/shared/reveal";
import { SectionKicker } from "@/components/shared/section-kicker";
import { Button } from "@/components/ui/button";

export function LatestBlog({ limit = 3 }: { limit?: number }) {
  const posts = useBlogPosts((s) => s.posts);
  const latest = [...posts]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, limit);

  if (latest.length === 0) return null;

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <SectionKicker center />
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">
              From the Blog
            </h2>
            <p className="mt-3 text-muted-foreground">
              EV charging news, OZEV grant updates, and buying guides from our team.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((post, index) => (
            <Reveal key={post.slug} delay={(index % 3) * 75}>
              <BlogCard post={post} />
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-12 flex justify-center">
            <Button
              size="lg"
              variant="outline"
              nativeButton={false}
              className="gap-2 border-primary/25 text-primary hover:bg-primary/5"
              render={<Link href="/blog" />}
            >
              Visit the blog
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
