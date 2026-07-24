import type { APIRoute } from "astro";
import { listAllPosts } from "../_utils/fs";
import type { ApiResponse } from "../_utils/types";

// Aggregated tag list endpoint.
//
// Returns deduplicated, sorted tags split by locale so the edit/new pages
// can populate <datalist> dropdowns. Unlike `getUniqueTags()` (which filters
// drafts/scheduled posts at build time), this scans every file on disk so
// admins see ALL tags — including those only used on draft posts.
//
// Response:
//   GET /admin/api/tags → { success: true, data: { zh: string[], en: string[] } }
export const GET: APIRoute = async () => {
  if (!import.meta.env.DEV) return new Response(null, { status: 404 });

  try {
    const posts = await listAllPosts();

    const zhTags = new Set<string>();
    const enTags = new Set<string>();

    for (const post of posts) {
      // Tags are stored as a string[] on PostFrontmatter. Defensively
      // guard against non-array values (malformed frontmatter).
      const zh = post.zhFrontmatter?.tags;
      if (Array.isArray(zh)) {
        for (const t of zh) {
          if (typeof t === "string" && t.trim()) zhTags.add(t.trim());
        }
      }
      const en = post.enFrontmatter?.tags;
      if (Array.isArray(en)) {
        for (const t of en) {
          if (typeof t === "string" && t.trim()) enTags.add(t.trim());
        }
      }
    }

    // Sort alphabetically. For mixed-script tags (e.g. Chinese + English in
    // the same list), localeCompare gives a stable, predictable order.
    const data = {
      zh: [...zhTags].sort((a, b) => a.localeCompare(b)),
      en: [...enTags].sort((a, b) => a.localeCompare(b)),
    };

    return Response.json({ success: true, data } satisfies ApiResponse<
      typeof data
    >);
  } catch (err) {
    // Surface the full stack on the server console so the next 500 is
    // debuggable. The client only gets the message — the stack may
    // contain file paths we don't want to leak to the browser.
    // eslint-disable-next-line no-console
    console.error("[/admin/api/tags] failed:", err);
    return Response.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      } satisfies ApiResponse,
      { status: 500 }
    );
  }
};
