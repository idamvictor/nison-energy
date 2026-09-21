"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/catalog/queries";
import {
  adminRoute,
  categoryRoute,
  type ProductCategory,
  type ProductInput,
  type WriteResult,
} from "@/lib/catalog/types";
import { CACHE_TAGS } from "@/lib/cache/tags";

function revalidate(category: ProductCategory) {
  revalidatePath(categoryRoute[category]);
  revalidatePath(`${categoryRoute[category]}/[slug]`, "page");
  revalidatePath(adminRoute[category]);
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/account/wishlist");
  revalidateTag(CACHE_TAGS.products, { expire: 0 });
}

export async function saveProduct(
  category: ProductCategory,
  originalId: string,
  slug: string,
  isNew: boolean,
  input: ProductInput,
): Promise<WriteResult> {
  const result = isNew
    ? await createProduct(slug, { ...input, category })
    : await updateProduct(originalId, slug, { ...input, category });
  if (result.ok) revalidate(category);
  return result;
}

export async function removeProduct(
  category: ProductCategory,
  id: string,
): Promise<WriteResult> {
  const result = await deleteProduct(id);
  if (result.ok) revalidate(category);
  return result;
}
