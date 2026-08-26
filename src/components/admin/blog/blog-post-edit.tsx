"use client";

import Link from "next/link";

import { BlogPostForm } from "@/components/admin/blog/blog-post-form";
import { useBlogPosts } from "@/hooks/use-blog-posts";

export function BlogPostEdit({ slug }: { slug: string }) {
  const post = useBlogPosts((s) => s.posts.find((p) => p.slug === slug));

  if (!post) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-16 text-center">
        <p className="text-sm font-medium text-foreground">Article not found</p>
        <Link href="/admin/blog" className="text-sm font-medium text-primary hover:underline">
          Back to blog
        </Link>
      </div>
    );
  }

  return <BlogPostForm post={post} />;
}
