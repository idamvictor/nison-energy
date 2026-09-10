import type { Metadata } from "next";

import { BlogPostsView } from "@/components/admin/blog/blog-posts-view";
import { getAllPosts, toAdminRow } from "@/lib/blog/queries";

export const metadata: Metadata = { title: "Blog | Admin" };

export default async function AdminBlogPage() {
  const posts = await getAllPosts();
  return <BlogPostsView posts={posts.map(toAdminRow)} />;
}
