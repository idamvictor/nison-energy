import type { Metadata } from "next";

import { BlogPostsPage } from "@/components/admin/blog/blog-posts-page";

export const metadata: Metadata = { title: "Blog | Admin" };

export default function AdminBlogPage() {
  return <BlogPostsPage />;
}
