import "server-only";

import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/db";
import type { ProductCategory } from "@/lib/catalog/types";
import type { SearchResult } from "@/lib/search/types";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { CACHE_TTL } from "@/lib/cache/config";

// Strips tsquery operator characters from a token so user input can never be
// interpreted as query syntax, then marks it for prefix matching so results
// start appearing before the user finishes typing a word.
const TSQUERY_SPECIAL_RE = /['&|!():*]/g;

export function toPrefixTsQuery(raw: string): string | null {
  const tokens = raw
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .map((token) => token.replace(TSQUERY_SPECIAL_RE, ""))
    .filter(Boolean);
  if (tokens.length === 0) return null;
  return tokens.map((token) => `${token}:*`).join(" & ");
}

type SearchRow = {
  id: string;
  category: ProductCategory;
  name: string;
  brand: string;
  cardImage: string;
  price: number | null;
  tags: string[];
  spec: string;
  tagline: string;
};

/**
 * Full-text search across every searchable Product column — not just name,
 * but brand/colour/tags/spec/connectionType/style/phase/tagline/description/
 * features/specs/variantGroup and the option arrays too. The catalog is small
 * enough (the category pages already ship the whole array client-side) that
 * building the tsvector inline at query time, with no stored column or GIN
 * index, is plenty fast — no migration needed.
 */
const searchProductsCached = unstable_cache(
  async (tsQuery: string, limit: number): Promise<SearchResult[]> => {
  const rows = await prisma.$queryRaw<SearchRow[]>`
    WITH scored AS (
      SELECT
        "id", "category", "name", "brand", "cardImage", "price", "tags",
        coalesce("spec", '') AS spec,
        coalesce("tagline", '') AS tagline,
        to_tsvector('english',
          coalesce("name", '') || ' ' ||
          coalesce("brand", '') || ' ' ||
          coalesce("colour", '') || ' ' ||
          array_to_string("tags", ' ') || ' ' ||
          coalesce("spec", '') || ' ' ||
          coalesce("connectionType", '') || ' ' ||
          coalesce("cableLength", '') || ' ' ||
          coalesce("powerOutput", '') || ' ' ||
          coalesce("style", '') || ' ' ||
          coalesce("phase", '') || ' ' ||
          coalesce("tagline", '') || ' ' ||
          array_to_string("description", ' ') || ' ' ||
          array_to_string("features", ' ') || ' ' ||
          coalesce("specs"::text, '') || ' ' ||
          coalesce("variantGroup", '') || ' ' ||
          array_to_string("compatibleTariffs", ' ') || ' ' ||
          array_to_string("lengthOptions", ' ') || ' ' ||
          array_to_string("cableLengthOptions", ' ')
        ) AS doc
      FROM "Product"
      WHERE "active" = true
    )
    SELECT "id", "category", "name", "brand", "cardImage", "price"::float8 AS "price", "tags", spec, tagline
    FROM scored
    WHERE doc @@ to_tsquery('english', ${tsQuery})
    ORDER BY ts_rank(doc, to_tsquery('english', ${tsQuery})) DESC, "id" ASC
    LIMIT ${limit}
  `;

  return rows.map((row) => ({
    id: row.id,
    category: row.category,
    name: row.name,
    brand: row.brand,
    snippet: row.tagline || row.spec,
    image: row.cardImage,
    price: row.price,
    tags: row.tags,
  }));
  },
  ["search-products"],
  { tags: [CACHE_TAGS.products], revalidate: CACHE_TTL.search },
);

export async function searchProducts(
  query: string,
  limit = 30,
): Promise<SearchResult[]> {
  const tsQuery = toPrefixTsQuery(query);
  if (!tsQuery) return [];
  return searchProductsCached(tsQuery, limit);
}
