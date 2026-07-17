import {
  defineConfig,
  envField,
  fontProviders,
  svgoOptimizer,
} from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { unified } from "@astrojs/markdown-remark";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import rehypeCallouts from "rehype-callouts";
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";
import { transformerFileName } from "./src/utils/transformers/fileName";
import config from "./astro-paper.config";

export default defineConfig({
  site: config.site.url,
  output: "static",
  integrations: [
    mdx(),
    sitemap({
      filter: page =>
        config.features?.showArchives !== false || !page.endsWith("/archives/"),
    }),
  ],
  markdown: {
    processor: unified({
      remarkPlugins: [
        remarkToc,
        [remarkCollapse, { test: "Table of contents" }],
      ],
      rehypePlugins: [rehypeCallouts],
    }),
    shikiConfig: {
      themes: { light: "min-light", dark: "night-owl" },
      defaultColor: false,
      wrap: false,
      transformers: [
        transformerFileName({ style: "v2", hideDot: false }),
        transformerNotationHighlight(),
        transformerNotationWordHighlight(),
        transformerNotationDiff({ matchAlgorithm: "v3" }),
      ],
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  fonts: [
    {
      name: "GoogleSansCode",
      cssVariable: "--font-google-sans-code",
      provider: fontProviders.local(),
      options: {
        variants: [
          {
            src: ["./src/assets/fonts/GoogleSansCode-Light.ttf"],
            weight: "300" as const,
          },
          {
            src: ["./src/assets/fonts/GoogleSansCode-LightItalic.ttf"],
            weight: "300" as const,
            style: "italic" as const,
          },
          {
            src: ["./src/assets/fonts/GoogleSansCode-Regular.ttf"],
            weight: "400" as const,
          },
          {
            src: ["./src/assets/fonts/GoogleSansCode-Italic.ttf"],
            weight: "400" as const,
            style: "italic" as const,
          },
          {
            src: ["./src/assets/fonts/GoogleSansCode-Medium.ttf"],
            weight: "500" as const,
          },
          {
            src: ["./src/assets/fonts/GoogleSansCode-MediumItalic.ttf"],
            weight: "500" as const,
            style: "italic" as const,
          },
          {
            src: ["./src/assets/fonts/GoogleSansCode-SemiBold.ttf"],
            weight: "600" as const,
          },
          {
            src: ["./src/assets/fonts/GoogleSansCode-SemiBoldItalic.ttf"],
            weight: "600" as const,
            style: "italic" as const,
          },
          {
            src: ["./src/assets/fonts/GoogleSansCode-Bold.ttf"],
            weight: "700" as const,
          },
          {
            src: ["./src/assets/fonts/GoogleSansCode-BoldItalic.ttf"],
            weight: "700" as const,
            style: "italic" as const,
          },
        ],
      },
    },
  ],
  env: {
    schema: {
      PUBLIC_GOOGLE_SITE_VERIFICATION: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
    },
  },
  experimental: {
    svgOptimizer: svgoOptimizer(),
  },
});
