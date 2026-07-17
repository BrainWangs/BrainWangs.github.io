import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { getSortedPosts } from "@/utils/getSortedPosts";
import { filterPostsByLocale } from "@/utils/postLocale";
import { getPostUrl } from "@/utils/getPostPaths";
import { localePaths, getLocale } from "@/utils/locale";
import type { APIRoute } from "astro";
import config from "@/config";

export { localePaths as getStaticPaths };

export const GET: APIRoute = async ({ params }) => {
  const locale = getLocale(params);
  const posts = await getCollection("posts");
  const localePosts = filterPostsByLocale(posts, locale);
  const sortedPosts = getSortedPosts(localePosts);

  return rss({
    title: config.site.title,
    description: config.site.description,
    site: config.site.url,
    items: sortedPosts.map(({ data, id, filePath }) => ({
      link: getPostUrl(id, filePath, locale),
      title: data.title,
      description: data.description,
      pubDate: new Date(data.modDatetime ?? data.pubDatetime),
    })),
  });
};
