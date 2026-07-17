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
  return matter.stringify(content.trimEnd(), frontmatter);
}
