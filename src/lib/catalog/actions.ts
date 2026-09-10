"use server";

import { revalidatePath } from "next/cache";

import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/catalog/queries";
import {
  categoryRoute,
  type ProductCategory,
  type ProductInput,
  type WriteResult,
} from "@/lib/catalog/types";

const adminRoute: Record<ProductCategory, string> = {
  Residential: "/admin/residential",
  Commercial: "/admin/commercial",
  Accessory: "/admin/accessories",
};

function revalidate(category: ProductCategory) {
  revalidatePath(categoryRoute[category]);
  revalidatePath(`${categoryRoute[category]}/[slug]`, "page");
  revalidatePath(adminRoute[category]);
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/account/wishlist");
}

export async function saveProduct(
  category: ProductCategory,
  slug: string,
  isNew: boolean,
  input: ProductInput,
): Promise<WriteResult> {
  const result = isNew
    ? await createProduct(slug, { ...input, category })
    : await updateProduct(slug, { ...input, category });
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
