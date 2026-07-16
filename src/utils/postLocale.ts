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
