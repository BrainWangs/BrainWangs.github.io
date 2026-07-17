import type { APIRoute } from "astro";
import {
  findPostFile,
  readRawPost,
  writePostFile,
  moveToRecycle,
} from "../_utils/fs";
import { parseFrontmatter } from "../_utils/frontmatter";
import type { ApiResponse, UpdatePostInput } from "../_utils/types";

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
        await writePostFile(
          slug,
          lc,
          body[lc].frontmatter,
          body[lc].content,
          ext
        );
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
