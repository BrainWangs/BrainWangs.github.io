import type { APIRoute } from "astro";
import { findPostFile, readRawPost, writePostFile } from "../_utils/fs";
import { parseFrontmatter } from "../_utils/frontmatter";
import type { ApiResponse, ReorderInput } from "../_utils/types";

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

    const now = Date.now();

    for (let i = 0; i < slugs.length; i++) {
      const newPubDatetime = new Date(now - i * 60000).toISOString();

      for (const lc of ["zh", "en"] as const) {
        const file = await findPostFile(slugs[i], lc);
        if (file) {
          const raw = await readRawPost(file);
          const { frontmatter, content } = parseFrontmatter(raw);
          frontmatter.pubDatetime = newPubDatetime;
          const ext = file.endsWith(".mdx")
            ? (".mdx" as const)
            : (".md" as const);
          await writePostFile(slugs[i], lc, frontmatter, content, ext);
        }
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
