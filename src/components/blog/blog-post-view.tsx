"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

import { SiteHeader } from "@/components/shared/site-header";
import { TrustBar } from "@/components/shared/trust-bar";
import { SiteFooter } from "@/components/shared/site-footer";
import { HelpSection } from "@/components/shared/help-section";
import { Badge } from "@/components/ui/badge";
import { BlogMarkdown } from "@/components/blog/blog-markdown";
import { useBlogPosts } from "@/hooks/use-blog-posts";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function BlogPostView({ slug }: { slug: string }) {
  const post = useBlogPosts((s) => s.posts.find((p) => p.slug === slug));

  if (!post) {
    return (
      <div className="flex min-h-full flex-1 flex-col">
        <SiteHeader />
        <TrustBar />
        <main className="flex-1">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 px-4 py-24 text-center">
            <h1 className="font-heading text-2xl font-semibold text-foreground">
              Article not found
            </h1>
            <p className="text-sm text-muted-foreground">
              This post may have been removed.
            </p>
            <Link href="/blog" className="mt-2 text-sm font-medium text-primary hover:underline">
              Back to the blog
            </Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <TrustBar />
      <main className="flex-1">
        <div className="relative overflow-hidden bg-foreground">
          <div className="relative h-72 sm:h-96">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(0deg, color-mix(in oklch, black 85%, var(--primary) 15%) 0%, transparent 60%)",
                opacity: 0.9,
              }}
            />
          </div>
          <div className="absolute inset-x-0 bottom-0">
            <div className="mx-auto max-w-3xl px-4 pb-10 sm:px-6 lg:px-8">
              <div className="flex flex-wrap gap-2">
                {post.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
              <h1 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-white sm:text-4xl">
                {post.title}
              </h1>
              <p className="mt-3 text-sm text-white/70">
                {formatDate(post.publishedAt)} · {post.author}
              </p>
            </div>
          </div>
        </div>

        <section className="bg-background">
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
            <Link
              href="/blog"
              className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              Back to the blog
            </Link>

            <BlogMarkdown content={post.bodyMarkdown} />

            {post.tags.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-2 border-t border-border pt-6">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </section>

        <HelpSection />
      </main>
      <SiteFooter />
    </div>
  );
}
