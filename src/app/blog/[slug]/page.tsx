import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogPostView } from "@/components/blog/blog-post-view";
import { getPostBySlug, getPostRow, getPublishedPosts } from "@/lib/blog/queries";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostRow(slug);
  if (!post) return { title: "Blog | Ocunio Energy" };

  return {
    title: `${post.title} | Ocunio Energy`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return <BlogPostView post={post} />;
}
