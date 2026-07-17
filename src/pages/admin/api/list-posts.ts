import type { APIRoute } from "astro";
import { listAllPosts } from "../_utils/fs";
import type { ApiResponse, PostPair } from "../_utils/types";

export const GET: APIRoute = async () => {
  if (!import.meta.env.DEV) return new Response(null, { status: 404 });

  try {
    const posts = await listAllPosts();
    return Response.json({ success: true, data: posts } satisfies ApiResponse<PostPair[]>);
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
