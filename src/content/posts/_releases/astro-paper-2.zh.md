---
lang: zh
author: Sat Naing
pubDatetime: 2023-01-30T15:57:52.737Z
title: AstroPaper 2.0
featured: false
ogImage: https://user-images.githubusercontent.com/53733092/215771435-25408246-2309-4f8b-a781-1f3d93bdf0ec.png
tags:
  - 版本发布
description: AstroPaper 借助 Astro v2 的增强功能进行全面升级。类型安全的 Markdown 内容、Bug 修复以及更好的开发体验等。
---

Astro 2.0 已正式发布，带来了许多令人兴奋的特性、破坏性变更、开发体验改进、更出色的错误提示等等。AstroPaper 充分利用了这些新特性，尤其是 Content Collections API。

<!-- ![Introducing AstroPaper 2.0](https://user-images.githubusercontent.com/53733092/215683840-dc2502f5-8c5a-44f0-a26c-4e7180455056.png) -->

![Introducing AstroPaper 2.0](https://user-images.githubusercontent.com/53733092/215771435-25408246-2309-4f8b-a781-1f3d93bdf0ec.png)

## 目录

## 特性与变更

### 类型安全的 Frontmatter 与重新定义的博客 Schema

得益于 Astro 的 Content Collections，AstroPaper 2.0 中 Markdown 内容的 frontmatter 现在是类型安全的。博客 Schema 定义在 `src/content/_schemas.ts` 文件中。

### 博客内容的新位置

所有博客文章已从 `src/contents` 目录迁移到 `src/content/blog` 目录。

### 全新的 Fetch API

内容现在通过 `getCollection` 函数获取，不再需要指定内容的相对路径。

```ts
// 旧的内容获取方式
- const postImportResult = import.meta.glob<MarkdownInstance<Frontmatter>>(
  "../contents/**/**/*.md",);

// 新的内容获取方式
+ const postImportResult = await getCollection("blog");
```

### 改进的搜索逻辑以获得更好的搜索结果

在旧版 AstroPaper 中，当用户搜索文章时，搜索匹配的关键字段包括 `title`、`description` 和 `headings`（heading 指博客文章中所有 h1 到 h6 的标题）。在 AstroPaper v2 中，只会根据用户输入搜索 `title` 和 `description`。

### 重命名的 Frontmatter 属性

以下 frontmatter 属性已重命名。

| 旧名称   | 新名称      |
| -------- | ----------- |
| datetime | pubDatetime |
| slug     | postSlug    |

### 博客文章的默认标签

如果某篇博客文章没有任何标签（即未指定 frontmatter 属性 `tags`），则该文章将使用默认标签 `others`。但你可以在 `/src/content/_schemas.ts` 文件中自定义默认标签。

```ts
// src/contents/_schemas.ts
export const blogSchema = z.object({
  // ---
  // 将 "others" 替换为你想要的默认值
  tags: z.array(z.string()).default(["others"]),
  ogImage: z.string().optional(),
  description: z.string(),
});
```

### 新的预定义深色配色方案

AstroPaper v2 新增了一套基于 Astro 深色 Logo 的深色配色方案（高对比度和低对比度）。查看[此链接](https://astro-paper.pages.dev/posts/predefined-color-schemes#astro-dark)了解更多信息。

![New Predefined Dark Color Scheme](https://user-images.githubusercontent.com/53733092/215680520-59427bb0-f4cb-48c0-bccc-f182a428d72d.svg)

### 自动类名排序

AstroPaper 2.0 集成了 [TailwindCSS Prettier 插件](https://tailwindcss.com/blog/automatic-class-sorting-with-prettier)，实现自动类名排序。

### 更新的文档与 README

所有 [#docs](https://astro-paper.pages.dev/tags/docs/) 博客文章和 [README](https://github.com/satnaing/astro-paper#readme) 均已针对 AstroPaper v2 进行了更新。

## Bug 修复

- 修复博客文章页面中标签显示异常的问题
- 在标签页面中，面包屑导航的最后一部分现在统一转为小写以保持一致性
- 在标签页面中排除草稿文章
- 修复页面重新加载后 'onChange 值未更新' 的问题
