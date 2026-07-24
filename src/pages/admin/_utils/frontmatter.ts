import matter from "gray-matter";
import type { PostFrontmatter } from "./types";

export function parseFrontmatter(raw: string): {
  frontmatter: PostFrontmatter;
  content: string;
} {
  const { data, content } = matter(raw);
  return {
    frontmatter: data as PostFrontmatter,
    content: content.trimStart(),
  };
}

export function serializeFrontmatter(
  frontmatter: PostFrontmatter,
  content: string
): string {
  // Normalize date fields to Date objects so js-yaml emits unquoted ISO
  // timestamps (e.g. `pubDatetime: 2024-01-01T00:00:00.000Z`) instead of
  // strings, which would fail the `z.date()` schema in content.config.ts.
  const safe = normalizeFrontmatterDates(frontmatter);
  return matter.stringify(content.trimEnd(), safe);
}

const DATE_KEYS = ["pubDatetime", "modDatetime"] as const;

/**
 * Convert date-like strings into Date instances so gray-matter / js-yaml
 * serializes them as YAML timestamps (unquoted) rather than strings.
 * Idempotent — Date instances pass through unchanged.
 */
export function normalizeFrontmatterDates<T extends PostFrontmatter>(fm: T): T {
  const out = { ...fm } as Record<string, unknown>;
  for (const key of DATE_KEYS) {
    const v = out[key];
    if (typeof v === "string" && v.length > 0) {
      const d = new Date(v);
      if (!Number.isNaN(d.getTime())) out[key] = d;
    } else if (v instanceof Date && Number.isNaN(v.getTime())) {
      delete out[key];
    }
  }
  return out as T;
}
