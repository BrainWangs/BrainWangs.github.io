import type { APIRoute } from "astro";
import { writePostFile, findPostFile } from "../_utils/fs";
import { normalizeFrontmatterDates } from "../_utils/frontmatter";
import type { CreatePostInput, ApiResponse } from "../_utils/types";

// Astro v7 with `output: 'static'` only runs GET handlers on endpoints by
// default. POST/PUT/DELETE handlers are silently dropped unless the page is
// marked as server-rendered. This is the root cause of "post submission
// fails silently" — without this line, the handler never runs.
export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!import.meta.env.DEV) return new Response(null, { status: 404 });

  try {
    const body: CreatePostInput = await request.json();
    if (!body.slug?.trim()) {
      return Response.json(
        { success: false, error: "Slug is required" } satisfies ApiResponse,
        { status: 400 }
      );
    }

    for (const lc of ["zh", "en"] as const) {
      if (body[lc]) {
        const existing = await findPostFile(body.slug, lc);
        if (existing) {
          return Response.json(
            {
              success: false,
              error: `Post ${body.slug}.${lc}.md already exists`,
            } satisfies ApiResponse,
            { status: 409 }
          );
        }
      }
    }

    for (const lc of ["zh", "en"] as const) {
      if (body[lc]) {
        // Defensive: clients may send dates as ISO strings. Convert to Date
        // instances so serializeFrontmatter emits unquoted YAML timestamps
        // accepted by the `z.date()` schema in content.config.ts.
        const safeFrontmatter = normalizeFrontmatterDates(body[lc].frontmatter);
        await writePostFile(
          body.slug,
          lc,
          safeFrontmatter,
          body[lc].content
        );
      }
    }

    return Response.json(
      { success: true, data: { slug: body.slug } } satisfies ApiResponse<{
        slug: string;
      }>,
      { status: 201 }
    );
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
