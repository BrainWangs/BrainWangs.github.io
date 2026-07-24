import type { APIRoute } from "astro";
import {
  listRecycled,
  restoreFromRecycle,
  permanentDelete,
} from "../../_utils/fs";
import type { ApiResponse, RecycleEntry } from "../../_utils/types";

// Admin-only, dev-only endpoint. See posts.ts for rationale on
// why `prerender = false` was removed (NoAdapterInstalled on build).

function getSlug(url: URL): string {
  return url.searchParams.get("slug") || "";
}

export const GET: APIRoute = async () => {
  if (!import.meta.env.DEV) return new Response(null, { status: 404 });
  const entries = await listRecycled();
  return Response.json({ success: true, data: entries } satisfies ApiResponse<
    RecycleEntry[]
  >);
};

export const POST: APIRoute = async ({ url }) => {
  if (!import.meta.env.DEV) return new Response(null, { status: 404 });
  try {
    await restoreFromRecycle(getSlug(url));
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
    await permanentDelete(getSlug(url));
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
