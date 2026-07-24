import type { APIRoute } from "astro";
import {
  findPostFile,
  readRawPost,
  writePostFile,
  moveToRecycle,
} from "../_utils/fs";
import {
  parseFrontmatter,
  normalizeFrontmatterDates,
} from "../_utils/frontmatter";
import type { ApiResponse, UpdatePostInput, PostFrontmatter } from "../_utils/types";

// Astro v7 static mode: GET runs by default, but PUT and DELETE handlers
// are silently dropped unless this endpoint is marked server-rendered.
export const prerender = false;

function getSlug(url: URL): string {
  return url.searchParams.get("slug") || "";
}

export const GET: APIRoute = async ({ url }) => {
  if (!import.meta.env.DEV) return new Response(null, { status: 404 });

  try {
    const slug = getSlug(url);
    const result: Record<string, unknown> = { slug };

    for (const lc of ["zh", "en"] as const) {
      const file = await findPostFile(slug, lc);
      if (file) {
        const raw = await readRawPost(file);
        const { frontmatter, content } = parseFrontmatter(raw);
        result[lc] = { frontmatter, content };
      } else {
        result[lc] = null;
      }
    }

    return Response.json({ success: true, data: result } satisfies ApiResponse<
      Record<string, unknown>
    >);
  } catch (err) {
    return Response.json(
      { success: false, error: String(err) } satisfies ApiResponse,
      { status: 500 }
    );
  }
};

export const PUT: APIRoute = async ({ url, request }) => {
  if (!import.meta.env.DEV) return new Response(null, { status: 404 });

  const slug = getSlug(url);
  let body: UpdatePostInput;
  try {
    const text = await request.text();
    body = text ? JSON.parse(text) : {};
  } catch {
    return Response.json(
      { success: false, error: "Invalid JSON body" } satisfies ApiResponse,
      { status: 400 }
    );
  }

  try {
    for (const lc of ["zh", "en"] as const) {
      if (body[lc]) {
        const existing = await findPostFile(slug, lc);
        const ext = existing?.endsWith(".mdx")
          ? (".mdx" as const)
          : (".md" as const);

        // Merge with existing frontmatter so fields not exposed in the
        // editor UI (author, lang, ogImage, canonicalURL, hideEditPost,
        // timezone) are preserved instead of being wiped on save.
        let mergedFrontmatter: PostFrontmatter;
        if (existing) {
          const raw = await readRawPost(existing);
          const oldFm = parseFrontmatter(raw).frontmatter;
          mergedFrontmatter = { ...oldFm, ...body[lc].frontmatter };
        } else {
          mergedFrontmatter = { ...body[lc].frontmatter };
        }

        // Keep the original pubDatetime if the editor cleared the
        // datetime-local input (defensive — schema requires this field).
        if (!mergedFrontmatter.pubDatetime && existing) {
          const raw = await readRawPost(existing);
          const oldFm = parseFrontmatter(raw).frontmatter;
          if (oldFm.pubDatetime) mergedFrontmatter.pubDatetime = oldFm.pubDatetime;
        }

        // Always refresh modDatetime so the post sorts to the top via
        // getSortedPosts (which sorts by modDatetime ?? pubDatetime).
        mergedFrontmatter.modDatetime = new Date();

        const safeFrontmatter = normalizeFrontmatterDates(mergedFrontmatter);
        await writePostFile(slug, lc, safeFrontmatter, body[lc].content, ext);
      }
    }

    return Response.json({ success: true } satisfies ApiResponse);
  } catch (err) {
    return Response.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      } satisfies ApiResponse,
      { status: 500 }
    );
  }
};

export const DELETE: APIRoute = async ({ url }) => {
  if (!import.meta.env.DEV) return new Response(null, { status: 404 });

  try {
    await moveToRecycle(getSlug(url));
    return Response.json({ success: true } satisfies ApiResponse);
  } catch (err) {
    return Response.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      } satisfies ApiResponse,
      { status: 500 }
    );
  }
};
