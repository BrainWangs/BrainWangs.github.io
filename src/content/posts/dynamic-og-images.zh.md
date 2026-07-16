---
author: Sat Naing
pubDatetime: 2022-12-28T04:59:04.866Z
modDatetime: 2026-06-03T00:00:00.000Z
title: AstroPaper 博客文章的动态 OG 图像生成
slug: dynamic-og-image-generation-in-astropaper-blog-posts
featured: false
draft: false
tags:
  - 文档
  - 发布
description: AstroPaper v1.4.0 的新功能，为博客文章引入动态 OG 图像生成。
---

AstroPaper v1.4.0 的新功能，为博客文章引入动态 OG 图像生成。

![AstroPaper 博客文章的动态 OG 图像生成](/posts/dynamic-og-image-generation-in-astropaper-blog-posts/index.png)

## 目录

## 简介

OG 图像（又称社交图像）在社交媒体互动中扮演着重要角色。如果你还不知道 OG 图像是什么，它是指当我们分享网站 URL 到社交媒体（如 Facebook、Discord 等）时显示的图像。

> Twitter 使用的社交图像在技术上不叫 OG 图像。但在本文中，我将使用 OG 图像这个术语来指代所有类型的社交图像。

## 默认/静态 OG 图像（旧方式）

AstroPaper 已经提供了为博客文章添加 OG 图像的方法。作者可以在 frontmatter 中通过 `ogImage` 指定 OG 图像。即使作者没有在 frontmatter 中定义 OG 图像，也会使用默认的 OG 图像作为回退（即 `public/default-og.jpg`）。但问题在于，默认的 OG 图像是静态的，这意味着所有未在 frontmatter 中指定 OG 图像的博客文章，尽管标题和内容各不相同，却始终使用同一张默认 OG 图像。

## 动态 OG 图像

为每篇文章生成动态 OG 图像，使作者无需为每一篇博客文章单独指定 OG 图像。此外，这还能避免所有博客文章的回退 OG 图像千篇一律的问题。

在 AstroPaper v1.4.0 中，使用了 Vercel 的 [Satori](https://github.com/vercel/satori) 包来实现动态 OG 图像生成。

在 AstroPaper v6+ 中，核心思路保持不变（Satori 渲染 SVG，然后通过 [Sharp](https://sharp.pixelplumbing.com/) 生成 PNG），但字体来源于 Astro 的 **Fonts** 配置，并通过 [`experimental_getFontFileURL()`](https://astro.build/blog/astro-620/) 加载，使 OG 生成可以复用与站点相同的字体管线。

动态 OG 图像将在构建时为满足以下条件的博客文章生成：

- 未在 frontmatter 中指定 OG 图像
- 未被标记为草稿。

## AstroPaper 动态 OG 图像的构成

动态 OG 图像包含*博客文章标题*、*作者名称*和*站点标题*。作者名称和站点标题从 `astro-paper.config.ts` 中的 `site.author` 和 `site.title` 获取。标题则从博客文章 frontmatter 中的 `title` 生成。

![动态 OG 图像示例链接](https://user-images.githubusercontent.com/53733092/209704501-e9c2236a-3f4d-4c67-bab3-025aebd63382.png)

### 非拉丁字符问题

> [!CAUTION]
> 包含非拉丁字符的标题默认无法正常显示。请将 Google 字体族切换为能够覆盖你的书写系统的字体，并同时包含 **`400`** 和 **`700`** 两种字重——Satori 为常规和粗体使用独立的缓冲区，缺少任一字重都会导致渲染不一致。

```ts file="astro.config.ts"
import { defineConfig, fontProviders } from "astro/config";

export default defineConfig({
  fonts: [
    {
      // 示例：覆盖日文字符（请根据你的受众需求选择合适的字体）
      name: "Noto Sans JP",
      cssVariable: "--font-google-sans-code",
      provider: fontProviders.google(),
      fallbacks: ["monospace"],
      weights: [400, 700],
      styles: ["normal", "italic"],
      formats: ["woff", "ttf"],
    },
  ],
});
```

如果你修改了 `cssVariable`，请同步更新以下文件中的对应键：

- `src/pages/og.png.ts`
- `src/pages/posts/[...slug]/index.png.ts`

> 查看 [此 PR](https://github.com/satnaing/astro-paper/pull/318) 了解更多信息。

> [!WARNING] 注意事项
>
> - **构建时间**随内容量增长——构建时会为每篇符合条件的文章生成一张 PNG。v6 中生成速度有所提升（PR [#632](https://github.com/satnaing/astro-paper/pull/632)），但在非常大型的站点上，你可以通过 `astro-paper.config.ts` 中的 `features.dynamicOgImage: false` 来禁用该功能。
> - **RTL 语言**目前不受支持。
> - 标题中的**表情符号**可能会出现问题——某些表情符号可能无法正确渲染。
