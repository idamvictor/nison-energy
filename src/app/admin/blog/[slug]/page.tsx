import type { Metadata } from "next";

import { BlogPostEdit } from "@/components/admin/blog/blog-post-edit";
import { blogPostsSeed } from "@/lib/blog-posts";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPostsSeed.find((p) => p.slug === slug);
  return { title: post ? `${post.title} | Admin` : "Article | Admin" };
}

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <div className="mx-auto max-w-4xl">
      <BlogPostEdit slug={slug} />
    </div>
  );
}
