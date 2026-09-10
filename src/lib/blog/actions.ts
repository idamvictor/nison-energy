"use server";

import { revalidatePath } from "next/cache";

import { createPost, updatePost, deletePost } from "@/lib/blog/queries";
import type { PostInput, WriteResult } from "@/lib/blog/types";

function revalidate() {
  revalidatePath("/blog");
  revalidatePath("/blog/[slug]", "page");
  revalidatePath("/admin/blog");
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  revalidatePath("/blog/rss.xml");
}

export async function savePost(
  slug: string,
  isNew: boolean,
  input: PostInput,
): Promise<WriteResult> {
  const result = isNew
    ? await createPost(slug, input)
    : await updatePost(slug, input);
  if (result.ok) revalidate();
  return result;
}

export async function removePost(id: string): Promise<WriteResult> {
  const result = await deletePost(id);
  if (result.ok) revalidate();
  return result;
}
