import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { getSortedPosts } from "@/utils/getSortedPosts";
import { getPostSlug, getPostUrl } from "@/utils/getPostPaths";
import { localePaths } from "@/utils/locale";
import config from "@/config";

export { localePaths as getStaticPaths };

export async function GET() {
  const posts = await getCollection("posts");
  const sortedPosts = getSortedPosts(posts);

  // Deduplicate by slug so zh/en versions don't appear twice in the feed.
  const seen = new Set<string>();
  const deduped = sortedPosts.filter(p => {
    const slug = getPostSlug(p.id, p.filePath);
    if (seen.has(slug)) return false;
    seen.add(slug);
    return true;
  });

  return rss({
    title: config.site.title,
    description: config.site.description,
    site: config.site.url,
    items: deduped.map(({ data, id, filePath }) => ({
      link: getPostUrl(id, filePath, config.site.lang),
      title: data.title,
      description: data.description,
      pubDate: new Date(data.modDatetime ?? data.pubDatetime),
    })),
  });
}
