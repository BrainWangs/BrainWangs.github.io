/**
 * Utilities for handling per-post locale (language) association.
 *
 * File naming convention:
 *   my-post.zh.md  → Chinese version
 *   my-post.en.md  → English version
 *   my-post.md     → Default locale (no suffix means default locale "zh")
 *
 * The locale suffix is stripped from the post ID for URL generation,
 * so both `my-post.zh` and `my-post.en` produce the same slug `my-post`.
 */

const LOCALE_RE = /\.(zh|en)$/;

/** Known locale codes that can appear as a file-name suffix. */
export const POST_LOCALES = ["zh", "en"] as const;
export type PostLocale = (typeof POST_LOCALES)[number];

/**
 * Extract the locale suffix from a post ID (e.g. "my-post.zh" → "zh").
 * Returns undefined if the ID has no locale suffix.
 */
export function getPostLocale(id: string): PostLocale | undefined {
  const match = id.match(LOCALE_RE);
  if (match && POST_LOCALES.includes(match[1] as PostLocale)) {
    return match[1] as PostLocale;
  }
  return undefined;
}

/**
 * Strip the locale suffix from a post ID so it can be used as a URL slug.
 *   "my-post.zh" → "my-post"
 *   "my-post.en" → "my-post"
 *   "my-post"    → "my-post"
 */
export function stripPostLocale(id: string): string {
  return id.replace(LOCALE_RE, "");
}

/**
 * Build the post ID that would match the same post in the target locale.
 *   ("my-post.zh", "en") → "my-post.en"
 *   ("my-post", "en")     → "my-post.en"
 */
export function getMatchedPostId(id: string, targetLocale: PostLocale): string {
  return stripPostLocale(id) + "." + targetLocale;
}

/**
 * Filter an array of collection entries to only include those matching the given locale.
 * Locale is determined from:
 *   1. The `lang` field in entry.data (when present — single source of truth)
 *   2. Fallback to file-name suffix (.zh or .en in the entry ID)
 *   3. Final fallback to POST_DEFAULT_LOCALE ("zh")
 *
 * Usage:
 *   const posts = await getCollection("posts");
 *   const zhPosts = filterPostsByLocale(posts, "zh");
 */
export function filterPostsByLocale<
  T extends { id: string; data?: { lang?: string | null } },
>(entries: T[], locale: string): T[] {
  return entries.filter(entry => {
    // 1. Check data.lang first (most reliable, explicitly set in frontmatter)
    if (entry.data?.lang) {
      return entry.data.lang === locale;
    }
    // 2. Fallback to filename suffix
    const entryLocale = getPostLocale(entry.id) ?? POST_DEFAULT_LOCALE;
    return entryLocale === locale;
  });
}

/** Fallback locale when the filename has no locale suffix. */
export const POST_DEFAULT_LOCALE: PostLocale = "zh";
