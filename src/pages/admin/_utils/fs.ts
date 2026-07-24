import type { PostFrontmatter, PostPair, RecycleEntry } from "./types";

export const RECYCLE_PATH = "src/content/_recycle";
const METADATA_FILE = "_metadata.json";
const ORDER_FILE = "_order.json";
const EXTENSIONS = [".md", ".mdx"] as const;

// Lazily load Node.js modules — only available in dev mode.
let _fs: typeof import("node:fs/promises") | null = null;
let _path: typeof import("node:path") | null = null;
let _parse:
  ((raw: string) => { frontmatter: PostFrontmatter; content: string }) | null =
  null;
let _serialize: ((fm: PostFrontmatter, content: string) => string) | null =
  null;

async function ensureFS() {
  if (!_fs) {
    _fs = await import("node:fs/promises");
    _path = await import("node:path");
    const fm = await import("./frontmatter");
    _parse = fm.parseFrontmatter;
    _serialize = fm.serializeFrontmatter;
  }
  return { fs: _fs!, path: _path!, parse: _parse!, serialize: _serialize! };
}

// ---- Path Helpers ----

async function resolvePostPath(relativePath: string): Promise<string> {
  const { path } = await ensureFS();
  const { BLOG_PATH } = await import("@/content.config");
  return path.resolve(process.cwd(), BLOG_PATH, relativePath);
}

async function resolveRecyclePath(relativePath: string): Promise<string> {
  const { path } = await ensureFS();
  return path.resolve(process.cwd(), RECYCLE_PATH, relativePath);
}

// ---- Post Discovery ----

export async function findPostFile(
  slug: string,
  locale: string
): Promise<string | null> {
  const { fs } = await ensureFS();
  const fullPath = await resolvePostPath(`${slug}.${locale}`);
  for (const ext of EXTENSIONS) {
    try {
      await fs.access(fullPath + ext);
      return `${slug}.${locale}${ext}`;
    } catch {
      /* continue */
    }
  }
  return null;
}

export async function listAllPosts(): Promise<PostPair[]> {
  const { fs, path, parse } = await ensureFS();
  const { getPostLocale, stripPostLocale } = await import("@/utils/postLocale");
  const pairs = new Map<string, PostPair>();

  async function walk(dir: string, prefix = "") {
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.name.startsWith("_")) continue;
      const full = path.join(dir, entry.name);
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        await walk(full, rel);
      } else if (entry.isFile() && /\.(md|mdx)$/.test(entry.name)) {
        const withoutExt = entry.name.replace(/\.(md|mdx)$/, "");
        const locale = getPostLocale(withoutExt);
        const baseSlug = stripPostLocale(withoutExt);
        const slug = prefix ? `${prefix}/${baseSlug}` : baseSlug;

        if (!pairs.has(slug)) {
          pairs.set(slug, {
            slug,
            subdirectory: prefix,
            zh: null,
            en: null,
            zhFrontmatter: null,
            enFrontmatter: null,
          });
        }
        const pair = pairs.get(slug)!;
        const filePath = rel;
        if (locale === "zh" || locale === "en") {
          // Read + parse in a try block so ONE malformed file (bad YAML,
          // BOM-only content, weird frontmatter) does not 500 the whole
          // listAllPosts call. The malformed file is skipped with a
          // console warning; the rest of the post list still renders.
          try {
            const raw = await fs.readFile(
              await resolvePostPath(filePath),
              "utf-8"
            );
            const fm = parse(raw).frontmatter;
            if (locale === "zh") {
              pair.zh = filePath;
              pair.zhFrontmatter = fm;
            } else {
              pair.en = filePath;
              pair.enFrontmatter = fm;
            }
          } catch (parseErr) {
            console.warn(
              `[admin] skipping malformed post file: ${filePath}`,
              parseErr
            );
          }
        }
      }
    }
  }

  await walk(await resolvePostPath(""));

  const result = [...pairs.values()];
  result.sort((a, b) => {
    const aDate =
      a.zhFrontmatter?.pubDatetime ?? a.enFrontmatter?.pubDatetime ?? "";
    const bDate =
      b.zhFrontmatter?.pubDatetime ?? b.enFrontmatter?.pubDatetime ?? "";
    return new Date(bDate).getTime() - new Date(aDate).getTime();
  });

  // Apply any manually-saved admin ordering on top of the date sort.
  // Slugs in the order file come first (in their declared order), the rest
  // keep the date-descending order from above. Slugs in the order file that
  // no longer exist are silently dropped.
  const savedOrder = await readPostOrder();
  if (savedOrder.length > 0) {
    const knownSlugs = new Set(result.map(p => p.slug));
    const pinned = savedOrder.filter(s => knownSlugs.has(s));
    if (pinned.length > 0) {
      result.sort((a, b) => {
        const aIdx = pinned.indexOf(a.slug);
        const bIdx = pinned.indexOf(b.slug);
        if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
        if (aIdx !== -1) return -1;
        if (bIdx !== -1) return 1;
        // Neither is pinned: keep their existing (date-desc) order.
        return 0;
      });
    }
  }

  return result;
}

// ---- Read/Write ----

export async function readRawPost(filePath: string): Promise<string> {
  const { fs } = await ensureFS();
  return fs.readFile(await resolvePostPath(filePath), "utf-8");
}

export async function writePostFile(
  slug: string,
  locale: "zh" | "en",
  frontmatter: PostFrontmatter,
  content: string,
  extension: ".md" | ".mdx" = ".md"
): Promise<void> {
  const { fs, path, serialize } = await ensureFS();
  const filePath = await resolvePostPath(`${slug}.${locale}${extension}`);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const text = serialize(frontmatter, content);
  await fs.writeFile(filePath, text, "utf-8");
}

// ---- Recycle Bin ----

async function readMetadata(): Promise<
  Record<string, { originalPath: string; deletedAt: string }>
> {
  const { fs } = await ensureFS();
  try {
    const raw = await fs.readFile(
      await resolveRecyclePath(METADATA_FILE),
      "utf-8"
    );
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeMetadata(data: Record<string, unknown>): Promise<void> {
  const { fs } = await ensureFS();
  await fs.mkdir(await resolveRecyclePath(""), { recursive: true });
  await fs.writeFile(
    await resolveRecyclePath(METADATA_FILE),
    JSON.stringify(data, null, 2),
    "utf-8"
  );
}

export async function moveToRecycle(slug: string): Promise<void> {
  const { fs, path } = await ensureFS();
  const metadata = await readMetadata();
  let deleted = false;

  // Ensure the recycle directory exists before trying to rename into it.
  // `fs.rename` does not create intermediate directories, and on a fresh
  // project `src/content/_recycle/` may not exist yet, causing ENOENT.
  const recycleDir = await resolveRecyclePath("");
  await fs.mkdir(recycleDir, { recursive: true });

  for (const locale of ["zh", "en"] as const) {
    const file = await findPostFile(slug, locale);
    if (file) {
      const src = await resolvePostPath(file);
      const basename = path.basename(file);
      const dest = await resolveRecyclePath(basename);
      await fs.rename(src, dest);
      deleted = true;
    }
  }

  if (!deleted) {
    throw new Error(`No files found for slug "${slug}"`);
  }

  const subdir = slug.includes("/")
    ? slug.substring(0, slug.lastIndexOf("/"))
    : "";
  metadata[slug] = {
    originalPath: subdir,
    deletedAt: new Date().toISOString(),
  };
  await writeMetadata(metadata);
}

export async function restoreFromRecycle(slug: string): Promise<void> {
  const { fs, path } = await ensureFS();
  const metadata = await readMetadata();
  const entry = metadata[slug];
  if (!entry) throw new Error(`No recycle entry for slug "${slug}"`);

  const recycleDir = await resolveRecyclePath("");
  const files = await fs.readdir(recycleDir);
  const baseFilename = path.basename(slug);

  const { stripPostLocale } = await import("@/utils/postLocale");

  for (const file of files) {
    if (file === METADATA_FILE) continue;
    const withoutExt = file.replace(/\.(md|mdx)$/, "");
    const testSlug = stripPostLocale(withoutExt);
    if (testSlug === baseFilename) {
      const src = await resolveRecyclePath(file);
      const destDir = entry.originalPath
        ? await resolvePostPath(entry.originalPath)
        : await resolvePostPath("");
      const dest = path.join(destDir, file);
      await fs.mkdir(destDir, { recursive: true });
      await fs.rename(src, dest);
    }
  }

  delete metadata[slug];
  await writeMetadata(metadata);
}

export async function permanentDelete(slug: string): Promise<void> {
  const { fs, path } = await ensureFS();
  const metadata = await readMetadata();
  const entry = metadata[slug];
  if (!entry) throw new Error(`No recycle entry for slug "${slug}"`);

  const recycleDir = await resolveRecyclePath("");
  const files = await fs.readdir(recycleDir);
  const baseFilename = path.basename(slug);

  const { stripPostLocale } = await import("@/utils/postLocale");

  for (const file of files) {
    if (file === METADATA_FILE) continue;
    const withoutExt = file.replace(/\.(md|mdx)$/, "");
    const testSlug = stripPostLocale(withoutExt);
    if (testSlug === baseFilename) {
      await fs.unlink(await resolveRecyclePath(file));
    }
  }

  delete metadata[slug];
  await writeMetadata(metadata);
}

export async function listRecycled(): Promise<RecycleEntry[]> {
  const { fs, path } = await ensureFS();
  const metadata = await readMetadata();
  let files: string[];
  try {
    files = await fs.readdir(await resolveRecyclePath(""));
  } catch {
    return [];
  }

  const entries: RecycleEntry[] = [];
  for (const [slug, info] of Object.entries(metadata)) {
    const baseFilename = path.basename(slug);
    entries.push({
      slug,
      originalPath: info.originalPath,
      zhExists: files.some(f => {
        const w = f.replace(/\.(md|mdx)$/, "");
        return w === `${baseFilename}.zh`;
      }),
      enExists: files.some(f => {
        const w = f.replace(/\.(md|mdx)$/, "");
        return w === `${baseFilename}.en`;
      }),
      deletedAt: info.deletedAt,
    });
  }
  return entries;
}

// ---- Manual Post Ordering ----
//
// The admin UI supports drag-and-drop reordering of the post list. The
// previous implementation overwrote each post's `pubDatetime` to encode the
// order, which permanently destroyed the original publish date and broke
// historical archives. We now persist the manual order in a separate
// metadata file (`src/content/_order.json`) keyed by slug — the source files
// themselves are left untouched.

async function resolveOrderPath(): Promise<string> {
  const { path } = await ensureFS();
  const { BLOG_PATH } = await import("@/content.config");
  // Store alongside posts so it's part of the same content tree but ignored
  // by the glob loader (pattern `**/[^_]*.{md,mdx}` skips `_`-prefixed files).
  return path.resolve(process.cwd(), BLOG_PATH, ORDER_FILE);
}

export async function readPostOrder(): Promise<string[]> {
  const { fs } = await ensureFS();
  try {
    const raw = await fs.readFile(await resolveOrderPath(), "utf-8");
    const data = JSON.parse(raw);
    return Array.isArray(data.order) ? (data.order as string[]) : [];
  } catch {
    return [];
  }
}

export async function writePostOrder(slugs: string[]): Promise<void> {
  const { fs, path } = await ensureFS();
  const filePath = await resolveOrderPath();
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(
    filePath,
    JSON.stringify({ order: slugs }, null, 2),
    "utf-8"
  );
}
