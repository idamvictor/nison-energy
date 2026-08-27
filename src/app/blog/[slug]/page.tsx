import type { Metadata } from "next";

import { BlogPostView } from "@/components/blog/blog-post-view";
import { blogPostsSeed } from "@/lib/blog-posts";

export function generateStaticParams() {
  return blogPostsSeed.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPostsSeed.find((p) => p.slug === slug);
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
  return <BlogPostView slug={slug} />;
}
