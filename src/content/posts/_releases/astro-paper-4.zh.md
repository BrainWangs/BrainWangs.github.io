---
lang: zh
author: Sat Naing
pubDatetime: 2024-01-04T09:30:41.816Z
title: AstroPaper 4.0
featured: false
ogImage: ../../../assets/images/AstroPaper-v4.png
tags:
  - 发布
description: "AstroPaper v4：带来更流畅、功能更丰富的博客体验。"
---

大家好！祝各位新年快乐 🎉，2024 年万事如意！我们很高兴地宣布 AstroPaper v4 正式发布，这是一次重大更新，引入了一系列新功能、改进和错误修复，旨在提升你的博客体验。衷心感谢所有贡献者的宝贵意见和努力，让版本 4 成为可能！

![AstroPaper v4](@/assets/images/AstroPaper-v4.png)

## 目录

## 重大变更

### 升级到 Astro v4 [#202](https://github.com/satnaing/astro-paper/pull/202)

AstroPaper 现在充分利用了 Astro v4 的强大功能和能力。不过，这是一次平滑的升级，不会对大多数 Astro 用户造成破坏性影响。

![Astro v4](https://astro.build/_astro/header-astro-4.YunweN9V_OmV0l.webp)

### 用 Astro Content 的 `slug` 替换 `postSlug` [#197](https://github.com/satnaing/astro-paper/pull/197)

博客内容 schema 中的 `postSlug` 在 AstroPaper v4 中不再可用。最初 Astro 没有 `slug` 机制，因此我们不得不自己想办法解决。自 Astro v3 起，它支持了内容集合和 slug 功能。现在，我们认为是时候采用 Astro 开箱即用的 `slug` 功能了。

**_文件: src/content/blog/astro-paper-4.md_**

```bash
---
author: Sat Naing
pubDatetime: 2024-01-01T04:35:33.428Z
title: AstroPaper 4.0
# slug: "" ❌ 不能为空字符串
---
```

`slug` 的行为现在略有不同。在之前版本的 AstroPaper 中，如果博客文章（markdown 文件）中没有指定 `postSlug`，则该博客文章的标题会被 slugify 化并用作 `slug`。然而，在 AstroPaper v4 中，如果未指定 `slug` 字段，则将使用 markdown 文件名作为 `slug`。需要注意的一点是，`slug` 字段可以省略，但不能为空字符串（slug: "" ❌）。

如果你正在从 v3 升级到 v4，请务必将 `src/content/blog/*.md` 文件中的 `postSlug` 替换为 `slug`。

## 新功能

### 添加内容创建代码片段 [#206](https://github.com/satnaing/astro-paper/pull/206)

AstroPaper 现在为新建博客文章提供了 VSCode 代码片段，无需手动复制粘贴 frontmatter 和内容结构（目录、标题、摘要等）。

点击[此处](https://code.visualstudio.com/docs/editor/userdefinedsnippets#:~:text=In%20Visual%20Studio%20Code%2C%20snippets,Snippet%20in%20the%20Command%20Palette)了解更多关于 VSCode 代码片段的信息。

<video autoplay muted="muted" controls plays-inline="true" class="border border-skin-line">
  <source src="https://github.com/satnaing/astro-paper/assets/53733092/136f1903-bade-40a2-b6bb-285a3c726350" type="video/mp4">
</video>

### 在博客文章中显示修改日期 [#195](https://github.com/satnaing/astro-paper/pull/195)

通过在博客文章中显示修改日期，让读者了解最新更新。这不仅增强了用户对文章时效性的信任，也有助于提升博客的 SEO。

![AstroPaper 中的最后修改日期功能](https://github.com/satnaing/astro-paper/assets/53733092/cc89585e-148e-444d-9da1-0d496e867175)

如果你对博客文章进行了修改，可以添加 `modDatetime` 字段。现在，文章的排序行为略有不同。所有文章按 `pubDatetime` 和 `modDatetime` 两者排序。如果文章同时具有 `pubDatetime` 和 `modDatetime`，其排序位置将由 `modDatetime` 决定。否则，仅根据 `pubDatetime` 来确定文章的排序顺序。

### 实现返回顶部按钮 [#188](https://github.com/satnaing/astro-paper/pull/188)

通过新实现的返回顶部按钮，增强博客详情页的用户导航体验。

![AstroPaper 中的返回顶部按钮](https://github.com/satnaing/astro-paper/assets/53733092/79854957-7877-4f19-936e-ad994b772074)

### 在标签文章中添加分页 [#201](https://github.com/satnaing/astro-paper/pull/201)

通过在标签文章中添加分页来改善内容组织和导航，使用户更容易浏览相关内容。这确保了如果一个标签下有很多文章，读者不会被所有标签相关的文章淹没。

<video autoplay loop="loop" muted="muted" plays-inline="true" class="border border-skin-line">
  <source src="https://github.com/satnaing/astro-paper/assets/53733092/9bad87f5-dcf5-4b79-b67a-d6c7244cd616" type="video/mp4">
</video>

### 动态生成 robots.txt [#130](https://github.com/satnaing/astro-paper/pull/130)

AstroPaper v4 现在动态生成 robots.txt 文件，让你对搜索引擎索引和网络爬虫有更多的控制权。此外，sitemap URL 也会被添加到 `robot.txt` 文件中。

### 添加 Docker-Compose 文件 [#174](https://github.com/satnaing/astro-paper/pull/174)

通过添加 Docker-Compose 文件，管理你的 AstroPaper 环境变得前所未有的简单，简化了部署和配置流程。

## 重构与错误修复

### 用去 Slugify 化的标签名替换 Slugify 化的标题 [#198](https://github.com/satnaing/astro-paper/pull/198)

为了提高清晰度、用户体验和 SEO，标签页中的标题（`Tag: some-tag`）不再被 slugify 化（`Tag: Some Tag`）。

![去 Slugify 化的标签名](https://github.com/satnaing/astro-paper/assets/53733092/2fe90d6e-ec52-467b-9c44-95009b3ae0b7)

### 使用 100svh 实现最小高度 ([79d569d](https://github.com/satnaing/astro-paper/commit/79d569d053036f2113519f41b0d257523d035b76))

我们将 body 的最小高度更新为 100svh，为移动用户提供更好的用户体验。

### 将站点 URL 更新为唯一数据源 [#143](https://github.com/satnaing/astro-paper/pull/143)

站点 URL 现在是唯一的数据源，简化了配置并避免了不一致。详情请参阅此 [PR](https://github.com/satnaing/astro-paper/pull/143) 及其相关问题。

### 解决浅色模式下代码块文本不可见的问题 [#163](https://github.com/satnaing/astro-paper/pull/163)

我们修复了浅色模式下代码块文本不可见的问题。

### 解码面包屑中的 Unicode 标签字符 [#175](https://github.com/satnaing/astro-paper/pull/175)

面包屑中标签的最后一部分现在会被解码，使非英文的 Unicode 字符显示得更好。

### 更新 LOCALE 配置以覆盖更广泛的区域设置 ([cd02b04](https://github.com/satnaing/astro-paper/commit/cd02b047d2b5e3b4a2940c0ff30568cdebcec0b8))

LOCALE 配置已更新，覆盖了更广泛的区域设置，以满足更多样化的受众需求。

## 结语

我们相信这些更新将显著提升你的 AstroPaper 使用体验。感谢每一位贡献代码、解决问题和为 AstroPaper 点星的人。我们期待看到你用 AstroPaper v4 创作的精彩内容！

祝写博客愉快！

[Sat Naing](https://satnaing.dev) <br/>
AstroPaper 作者
