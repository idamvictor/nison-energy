import { create } from "zustand";
import { persist } from "zustand/middleware";

import { blogPostsSeed, type BlogPost } from "@/lib/blog-posts";

type BlogPostsState = {
  posts: BlogPost[];
  addPost: (post: BlogPost) => void;
  updatePost: (slug: string, post: BlogPost) => void;
  removePost: (slug: string) => void;
};

// Real, admin-controlled blog content — seeded from the crawled Ocunio
// Energy articles, persisted like the rest of the app's client-side state
// so add/edit/remove from the admin panel actually sticks.
export const useBlogPosts = create<BlogPostsState>()(
  persist(
    (set) => ({
      posts: blogPostsSeed,
      addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),
      updatePost: (slug, post) =>
        set((state) => ({
          posts: state.posts.map((p) => (p.slug === slug ? post : p)),
        })),
      removePost: (slug) =>
        set((state) => ({
          posts: state.posts.filter((p) => p.slug !== slug),
        })),
    }),
    {
      name: "nison-blog-posts",
      skipHydration: true,
    }
  )
);
