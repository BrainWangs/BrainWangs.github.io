import type { APIRoute } from "astro";
import { writePostOrder } from "../_utils/fs";
import type { ApiResponse, ReorderInput } from "../_utils/types";

// Admin-only, dev-only endpoint. See posts.ts for rationale on
// why `prerender = false` was removed (NoAdapterInstalled on build).

export const POST: APIRoute = async ({ request }) => {
  if (!import.meta.env.DEV) return new Response(null, { status: 404 });

  try {
    const { slugs }: ReorderInput = await request.json();
    if (!Array.isArray(slugs)) {
      return Response.json(
        {
          success: false,
          error: "slugs must be an array",
        } satisfies ApiResponse,
        { status: 400 }
      );
    }

    // Persist the manual order in a sidecar metadata file instead of
    // rewriting each post's `pubDatetime`. The previous implementation
    // overwrote the original publish date (and re-saved every file), which
    // broke historical archives and was destructive.
    await writePostOrder(slugs);

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
