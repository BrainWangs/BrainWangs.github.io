---
pubDatetime: 2026-05-17T07:15:45.792Z
title: AstroPaper 6.0
slug: astro-paper-v6
featured: true
ogImage: assets/AstroPaper-v6.png
tags:
  - 版本发布
description: "AstroPaper v6：基于 Astro v6、Tailwind v4 和新配置系统的全面重写。"
---

AstroPaper v6 是一次完全重写，基于 Astro v6、Tailwind CSS v4 和 TypeScript v6 构建。此版本用统一的配置文件取代了旧的 `SITE` / `constants.ts` 配置方式，并在整个代码库中引入了多项结构性改进。

![AstroPaper v6](assets/AstroPaper-v6.png)

## 目录

## 主要变更

### 升级到 Astro v6

AstroPaper 现已随 Astro v6.3 发布，包括：

- **稳定的 Content Layer API** — `glob()` 加载器取代了旧的 `type: "content"` 集合模式。
- **稳定的 Fonts API** — `experimental.fonts` 已升级为 `astro.config.ts` 中的顶层 `fonts` 配置项。
- **TypeScript v6** — 全面支持最新的 TypeScript 编译器。

### 新的统一配置系统

`src/config.ts` 中的扁平 `SITE` 对象和独立的 `constants.ts` 文件已被项目根目录下的单个 `astro-paper.config.ts` 文件取代。使用 `defineAstroPaperConfig()` 可获得完整的智能提示：

```ts file="astro-paper.config.ts"
import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://your-site.com/",
    title: "AstroPaper",
    description: "…",
    author: "Your Name",
    lang: "en",
    timezone: "UTC",
    googleVerification: "your-verification-value",
  },
  posts: {
    perPage: 4,
    perIndex: 4,
    scheduledPostMargin: 15 * 60 * 1000, // ms
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: true,
    showArchives: true,
    showBackButton: true,
    editPost: { enabled: true, url: "https://github.com/…/edit/main/" },
    search: "pagefind",
  },
  socials: [{ name: "github", url: "https://github.com/…" }],
  shareLinks: [{ name: "x", url: "https://x.com/intent/post?url=" }],
});
```

所有选项——站点元数据、分页、功能开关、社交链接和分享链接——现在都集中在一个文件中。

### 稳定的 Fonts API

字体配置已从 `experimental.fonts` 升级为 `astro.config.ts` 中的顶层 `fonts` 配置项，与 Astro v6 的稳定 API 保持一致：

```ts file="astro.config.ts"
export default defineConfig({
  fonts: [
    {
      name: "Google Sans Code",
      cssVariable: "--font-google-sans-code",
      provider: fontProviders.google(),
      weights: [300, 400, 500, 600, 700],
      styles: ["normal", "italic"],
    },
  ],
});
```

### MDX 支持

现已内置 `@astrojs/mdx`。文章可以使用 `.mdx` 扩展名来嵌入组件、使用 JSX 表达式以及从其他文件导入。内容加载器模式 `**/[^_]*.{md,mdx}` 会自动识别这两种格式。

### 内容集合重构

博客文章已从 `src/data/blog/` 移至 `src/content/posts/`，以符合 Astro 的惯例。新增的 `pages` 集合位于 `src/content/pages/`，用于管理独立页面（关于页等）。`posts` 集合使用 Astro 的 `glob()` 加载器——不再使用 `defineCollection` 配合 `type: "content"`：

```ts file="src/content.config.ts"
const posts = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/posts" }),
  schema: ({ image }) =>
    z.object({
      author: z.string(),
      pubDatetime: z.date(),
      title: z.string(),
      tags: z.array(z.string()).default(["others"]),
      description: z.string(),
      // …
    }),
});
```

### 设计令牌系统

v5 中的 5 令牌调色板在 `src/styles/theme.css` 中已扩展为 7 个令牌。令牌以 CSS 自定义属性的方式定义，并通过 `@theme inline` 注册到 Tailwind v4：

```css file="src/styles/theme.css"
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-border: var(--border);
}

:root,
[data-theme="light"] {
  --background: #fdfdfd;
  --foreground: #282728;
  --accent: #006cac;
  --accent-foreground: #ffffff;
  --muted: #e6e6e6;
  --muted-foreground: #6b7280;
  --border: #ece9e9;
}

[data-theme="dark"] {
  --background: #212737;
  --foreground: #eaedf3;
  --accent: #ff6b01;
  --accent-foreground: #ffffff;
  --muted: #343f60;
  --muted-foreground: #afb9ca;
  --border: #ab4b08;
}
```

`theme.css` 是由 `global.css` 导入的独立文件。新增的两个令牌是 `--accent-foreground` 和 `--muted-foreground`。

### 国际化字符串提取

所有 UI 字符串已提取到 `src/i18n/lang/en.ts` 中，遵循 `UIStrings` 接口。添加新语言只需要在 `src/i18n/lang/` 中创建一个新文件：

```ts file="src/i18n/lang/en.ts"
export default {
  nav: { home: "Home", posts: "Posts" /* … */ },
  post: { publishedAt: "Published at" /* … */ },
  /* … */
} satisfies UIStrings;
```

`tplStr()` 辅助函数处理参数化字符串，使翻译者可以自由调整占位符的顺序。

### 基础路径和子目录部署支持

所有内部链接均通过 `getRelativeLocaleUrl()` 和 `withBase.ts` 辅助函数（`stripLocale`、`stripBase`、`getAssetPath`）处理。部署到子目录（例如 `/astro-paper`）无需手动更新链接。

### 通过配置设置 Google 站点验证

设置 Google 站点验证的首选方式是在 `astro-paper.config.ts` 中配置 `site.googleVerification`：

```ts file="astro-paper.config.ts"
export default defineAstroPaperConfig({
  site: {
    // …
    googleVerification: "your-google-site-verification-value",
  },
});
```

`PUBLIC_GOOGLE_SITE_VERIFICATION` 环境变量仍然作为后备方案得到支持，适用于不希望将值提交到配置文件的情况。

```bash file=".env"
PUBLIC_GOOGLE_SITE_VERIFICATION=your-google-site-verification-value
```

当两者同时设置时，`site.googleVerification` 优先。

## 其他值得关注的变更

- 更新并重命名了辅助/工具函数。
- 相邻文章导航（上一篇/下一篇）现在在 `getStaticPaths` 中一次性计算并作为 props 传递——组件不再为每个页面获取所有文章。
- `_components/` 作用域化：文章专属组件位于 `pages/posts/[...slug]/_components/` 下，不会污染全局的 `src/components/` 目录。
- `PostLayout.astro` 仅处理结构化数据和 SEO——文章页面的逻辑位于页面文件本身。

## 总结

AstroPaper v6 保留了其极简、清爽的外观，同时围绕 Astro v6 的新原语重建了内部架构。配置系统更简洁，代码库更易于导航，主题开箱即用地支持国际化和子目录部署。

## 参见

- [预定义配色方案](/posts/predefined-color-schemes/)
- [如何配置 AstroPaper 主题](/posts/how-to-configure-astropaper-theme/)
- [在 AstroPaper 中添加新文章](/posts/adding-new-posts-in-astropaper-theme/)
