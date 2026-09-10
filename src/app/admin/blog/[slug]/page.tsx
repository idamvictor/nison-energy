import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogPostForm } from "@/components/admin/blog/blog-post-form";
import { getPostRow } from "@/lib/blog/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostRow(slug);
  return { title: post ? `${post.title} | Admin` : "Article | Admin" };
}

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostRow(slug);
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <BlogPostForm post={post} />
    </div>
  );
}
