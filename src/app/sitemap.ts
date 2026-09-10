import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";
import { getPublishedPosts } from "@/lib/blog/queries";
import {
  getResidentialCatalog,
  getCommercialCatalog,
  getAccessoryCatalog,
} from "@/lib/catalog/queries";
import { grantSchemes } from "@/lib/content/grant-schemes";

export const revalidate = 3600;

// Public, indexable routes. Functional / gated areas (/account, /admin, /cart,
// /checkout, /sign-in) are deliberately excluded.
const STATIC_PATHS = [
  "/",
  "/home-charging",
  "/workplace-charging",
  "/accessories",
  "/blog",
  "/ozev-grants",
  "/ozev-grant-guide",
  "/ozev-grant-guide/renters-and-flat-owners",
  "/ozev-grant-guide/residential-landlords",
  "/ozev-grant-guide/workplace-charging-scheme",
  "/about-us",
  "/contact-us",
  "/faq",
  "/virtual-survey",
  "/independent-subcontractor",
  "/delivery-information",
  "/privacy-policy",
  "/terms-and-conditions",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, residential, commercial, accessories] = await Promise.all([
    getPublishedPosts(),
    getResidentialCatalog(),
    getCommercialCatalog(),
    getAccessoryCatalog(),
  ]);

  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
  }));

  const grantEntries: MetadataRoute.Sitemap = grantSchemes.map((scheme) => ({
    url: `${SITE_URL}/ozev-grants/${scheme.slug}`,
    lastModified: now,
  }));

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
  }));

  const productEntries: MetadataRoute.Sitemap = [
    ...residential.map((p) => `/home-charging/${p.id}`),
    ...commercial.map((p) => `/workplace-charging/${p.id}`),
    ...accessories.map((p) => `/accessories/${p.id}`),
  ].map((path) => ({ url: `${SITE_URL}${path}`, lastModified: now }));

  return [...staticEntries, ...grantEntries, ...postEntries, ...productEntries];
}
