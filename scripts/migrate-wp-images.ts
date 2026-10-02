/**
 * One-off: copy images that used to be hotlinked from the old WordPress site
 * (ocunioenergy.com/wp-content/uploads/…) into public/media/wp/…, so the new
 * site no longer depends on WordPress. ocunioenergy.com now serves this app,
 * so the files are fetched from the WordPress site's temporary domain.
 *
 *   npx tsx scripts/migrate-wp-images.ts            # download only
 *   npx tsx scripts/migrate-wp-images.ts --update-db # also rewrite Post.coverImage
 */
import "dotenv/config";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";

const OLD_BASE = "https://ocunioenergy.com/wp-content/uploads";
const WP_HOST = "https://deeppink-eland-172106.hostingersite.com/wp-content/uploads";
const NEW_BASE = "/media/wp";
const OUT_DIR = path.join(process.cwd(), "public", "media", "wp");

const SOURCE_FILES = [
  "src/app/blog/page.tsx",
  "src/app/home-charging/page.tsx",
  "src/app/ozev-grants/page.tsx",
  "src/app/workplace-charging/page.tsx",
  "src/components/about/about-hero.tsx",
  "src/components/about/origin-story.tsx",
  "src/components/auth/auth-shell.tsx",
  "src/components/home/category-cards.tsx",
  "src/components/home/hero.tsx",
  "src/components/home/trusted-installers.tsx",
  "src/lib/content/grant-schemes.ts",
  "prisma/seed-posts.ts",
  "prisma/seed-products.ts",
];

const IMAGE_EXT = /\.(png|jpe?g|webp|gif|svg|avif)$/i;
const FULL_URL = /https:\/\/ocunioenergy\.com\/wp-content\/uploads\/[^"'`\s)]+/g;

/** Paths relative to /wp-content/uploads, e.g. "2025/05/foo.png". */
async function collectFromSource(): Promise<Set<string>> {
  const paths = new Set<string>();
  for (const file of SOURCE_FILES) {
    const src = await readFile(file, "utf8");
    for (const url of src.match(FULL_URL) ?? []) {
      const rel = url.slice(OLD_BASE.length + 1);
      if (IMAGE_EXT.test(rel)) paths.add(rel);
    }
    // `${IMG}/…` where IMG is a directory under uploads.
    const base = src.match(/const IMG =\s*"https:\/\/ocunioenergy\.com\/wp-content\/uploads\/?([^"]*)"/);
    if (!base) continue;
    const dir = base[1].replace(/\/$/, "");
    for (const m of src.matchAll(/\$\{IMG\}\/([^`"'\s]+)/g)) {
      if (m[1].includes("${")) {
        console.warn(`dynamic path, check by hand: ${file}: ${m[0]}`);
        continue;
      }
      if (IMAGE_EXT.test(m[1])) paths.add(dir ? `${dir}/${m[1]}` : m[1]);
    }
  }
  return paths;
}

async function collectFromDb(db: Client): Promise<Set<string>> {
  const paths = new Set<string>();
  const { rows } = await db.query<{ coverImage: string }>(
    `select "coverImage" from "Post" where "coverImage" like $1`,
    [`${OLD_BASE}/%`],
  );
  for (const r of rows) paths.add(r.coverImage.slice(OLD_BASE.length + 1));
  return paths;
}

async function download(rel: string): Promise<string | null> {
  const res = await fetch(`${WP_HOST}/${rel}`);
  if (!res.ok) return `${res.status} ${rel}`;
  const dest = path.join(OUT_DIR, ...rel.split("/"));
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
  return null;
}

async function main() {
  const updateDb = process.argv.includes("--update-db");
  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();
  try {
    const paths = new Set([...(await collectFromSource()), ...(await collectFromDb(db))]);
    console.log(`${paths.size} images to copy`);

    const failures = (await Promise.all([...paths].map(download))).filter(Boolean);
    console.log(`copied ${paths.size - failures.length}/${paths.size}`);
    if (failures.length) {
      console.error("failed:\n" + failures.join("\n"));
      process.exitCode = 1;
      return;
    }

    if (updateDb) {
      const { rowCount } = await db.query(
        `update "Post" set "coverImage" = replace("coverImage", $1, $2) where "coverImage" like $3`,
        [OLD_BASE, NEW_BASE, `${OLD_BASE}/%`],
      );
      console.log(`updated ${rowCount} Post.coverImage rows`);
    }
  } finally {
    await db.end();
  }
}

main();
