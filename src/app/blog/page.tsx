import type { Metadata } from "next";

import { SiteHeader } from "@/components/shared/site-header";
import { TrustBar } from "@/components/shared/trust-bar";
import { SiteFooter } from "@/components/shared/site-footer";
import { CategoryHero } from "@/components/shared/category-hero";
import { HelpSection } from "@/components/shared/help-section";
import { BlogList } from "@/components/blog/blog-list";
import { getPublishedPosts } from "@/lib/blog/queries";

// Prerendered, but admin blog edits `revalidatePath` this route immediately.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blog | Ocunio Energy",
  description:
    "EV charging news, OZEV grant updates, and buying guides from the Ocunio Energy team.",
  alternates: {
    types: { "application/rss+xml": "/blog/rss.xml" },
  },
};

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <TrustBar />
      <main className="flex-1">
        <CategoryHero
          title="The Ocunio Energy Blog"
          subtitle="EV charging news, OZEV grant updates, and buying guides — written by our team."
          image="https://ocunioenergy.com/wp-content/uploads/2026/06/image-3.jpeg"
        />
        <BlogList posts={posts} />
        <HelpSection />
      </main>
      <SiteFooter />
    </div>
  );
}
