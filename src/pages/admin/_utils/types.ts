export interface ApiResponse<T = undefined> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PostFrontmatter {
  author?: string;
  pubDatetime: string;
  modDatetime?: string;
  title: string;
  slug?: string;
  featured?: boolean;
  draft?: boolean;
  tags?: string[];
  ogImage?: string;
  description: string;
  canonicalURL?: string;
  hideEditPost?: boolean;
  timezone?: string;
}

export interface PostPair {
  slug: string;
  subdirectory: string;
  zh: string | null;
  en: string | null;
  zhFrontmatter: PostFrontmatter | null;
  enFrontmatter: PostFrontmatter | null;
}

export interface RecycleEntry {
  slug: string;
  originalPath: string;
  zhExists: boolean;
  enExists: boolean;
  deletedAt: string;
}

export interface CreatePostInput {
  slug: string;
  zh?: { frontmatter: PostFrontmatter; content: string };
  en?: { frontmatter: PostFrontmatter; content: string };
}

export interface UpdatePostInput {
  zh?: { frontmatter: PostFrontmatter; content: string };
  en?: { frontmatter: PostFrontmatter; content: string };
}

export interface ReorderInput {
  slugs: string[];
}
