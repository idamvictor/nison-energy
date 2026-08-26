import type { Metadata } from "next";

import { BlogPostForm } from "@/components/admin/blog/blog-post-form";

export const metadata: Metadata = { title: "Add article | Admin" };

export default function NewBlogPostPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <BlogPostForm />
    </div>
  );
}
