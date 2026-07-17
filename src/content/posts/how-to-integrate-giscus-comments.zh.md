---
lang: zh
author: FjellOverflow
pubDatetime: 2024-07-25T11:11:53Z
modDatetime: 2025-03-12T12:28:53Z
title: 如何将 Giscus 评论集成到 AstroPaper
featured: false
draft: false
tags:
  - astro
  - blog
  - docs
description: 使用 Giscus 为托管在 GitHub Pages 上的静态博客添加评论功能。
---

在 [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site) 等平台上托管轻量级静态博客有很多优势，但也会牺牲一些交互性。幸运的是，[Giscus](https://giscus.app/) 的出现为静态网站提供了一种嵌入用户评论的方式。

## 目录

## _Giscus_ 的工作原理

[Giscus 使用 GitHub API](https://github.com/giscus/giscus?tab=readme-ov-file#how-it-works) 来读取和存储 _GitHub_ 用户在仓库关联的 `Discussions` 中发表的评论。

将 _Giscus_ 客户端脚本包嵌入到你的网站中，配置正确的仓库 URL，用户就可以查看和发表评论（需要登录 _GitHub_）。

这种方式是无服务器的，因为评论存储在 _GitHub_ 上并从客户端动态加载，因此非常适合像 _AstroPaper_ 这样的静态博客。

## 配置 _Giscus_

_Giscus_ 可以在 [giscus.app](https://giscus.app/) 上轻松配置，但我仍简要概述一下这个过程。

### 前提条件

要使 _Giscus_ 正常工作，需要满足以下条件：

- 仓库必须为[公开](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility#making-a-repository-public)
- 已安装 [Giscus 应用](https://github.com/apps/giscus)
- 仓库已开启 [Discussions](https://docs.github.com/en/github/administering-a-repository/managing-repository-settings/enabling-or-disabling-github-discussions-for-a-repository) 功能

如果上述任一条件因任何原因无法满足，很遗憾，_Giscus_ 将无法集成。

### 配置 _Giscus_

接下来需要对 _Giscus_ 进行配置。在大多数情况下，预选的默认设置都是合适的，只有在你明确知道自己在做什么且有特定理由时才需要修改它们。不必过于担心做出错误的选择，你随时可以在之后调整配置。

不过你需要：

- 为界面选择合适的语言
- 指定要连接的 _GitHub_ 仓库，通常是包含你在 _GitHub Pages_ 上静态托管的 _AstroPaper_ 博客的仓库
- 如果你希望确保没有人能直接在 _GitHub_ 上随意创建评论，可以在 _GitHub_ 上创建一个 `Announcement` 类型的讨论
- 定义配色方案

配置完成后，_Giscus_ 会为你生成一个 `<script>` 标签，在接下来的步骤中你会用到它。

## 简单的脚本标签方式

你现在应该有一个如下所示的脚本标签：

```html
<script
  src="https://giscus.app/client.js"
  data-repo="[ENTER REPO HERE]"
  data-repo-id="[ENTER REPO ID HERE]"
  data-category="[ENTER CATEGORY NAME HERE]"
  data-category-id="[ENTER CATEGORY ID HERE]"
  data-mapping="pathname"
  data-strict="0"
  data-reactions-enabled="1"
  data-emit-metadata="0"
  data-input-position="bottom"
  data-theme="preferred_color_scheme"
  data-lang="en"
  crossorigin="anonymous"
  async
></script>
```

将其添加到网站的源代码中即可。如果你正在使用 _AstroPaper_ 并希望为文章启用评论功能，最可能的做法是找到 `PostDetails.astro` 文件，将脚本标签粘贴到你希望评论出现的位置，比如放在 `Share this post on:` 按钮下方。

```astro file=src/layouts/PostDetails.astro
<Layout {...layoutProps}>
  <main>
    <ShareLinks />

    <!-- [!code ++:6] -->
    <script
      src="https://giscus.app/client.js"
      data-repo="[ENTER REPO HERE]"
      data-repo-id="[ENTER REPO ID HERE]"
      data-category="[ENTER CATEGORY NAME HERE]"
      data-category-id="[ENTER CATEGORY ID HERE]"></script>
  </main>
  <Footer />
</Layout>
```

大功告成！你已经成功将评论功能集成到 _AstroPaper_ 中了！

## 支持浅色/深色主题的 React 组件

布局中嵌入的脚本标签比较静态，因为 _Giscus_ 的配置（包括 `theme`）都被硬编码在布局中。考虑到 _AstroPaper_ 提供了浅色/深色主题切换功能，如果评论也能随网站其他部分一起在浅色和深色主题之间无缝切换，那就更好了。要实现这一点，需要一种更精细的方式来嵌入 _Giscus_。

首先，我们需要安装 _Giscus_ 的 [React 组件](https://www.npmjs.com/package/@giscus/react)：

```bash
npm i @giscus/react && npx astro add react
```

然后在 `src/components` 中创建一个新的 `Comments.tsx` React 组件：

```tsx file=src/components/Comments.tsx
import Giscus, { type Theme } from "@giscus/react";
import { GISCUS } from "@/constants";
import { useEffect, useState } from "react";

interface CommentsProps {
  lightTheme?: Theme;
  darkTheme?: Theme;
}

export default function Comments({
  lightTheme = "light",
  darkTheme = "dark",
}: CommentsProps) {
  const [theme, setTheme] = useState(() => {
    const currentTheme = localStorage.getItem("theme");
    const browserTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";

    return currentTheme || browserTheme;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = ({ matches }: MediaQueryListEvent) => {
      setTheme(matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    const themeButton = document.querySelector("#theme-btn");
    const handleClick = () => {
      setTheme(prevTheme => (prevTheme === "dark" ? "light" : "dark"));
    };

    themeButton?.addEventListener("click", handleClick);

    return () => themeButton?.removeEventListener("click", handleClick);
  }, []);

  return (
    <div className="mt-8">
      <Giscus theme={theme === "light" ? lightTheme : darkTheme} {...GISCUS} />
    </div>
  );
}
```

这个 _React_ 组件不仅封装了原生的 _Giscus_ 组件，还引入了额外的 props，即 `lightTheme` 和 `darkTheme`。通过利用两个事件监听器，_Giscus_ 评论会与网站主题保持一致，在网站或浏览器主题发生变化时动态切换深色和浅色主题。

我们还需要定义 `GISCUS` 配置，最佳位置是在 `constants.ts` 中：

```ts file=src/constants.ts
import type { GiscusProps } from "@giscus/react";

...

export const GISCUS: GiscusProps = {
  repo: "[ENTER REPO HERE]",
  repoId: "[ENTER REPO ID HERE]",
  category: "[ENTER CATEGORY NAME HERE]",
  categoryId: "[ENTER CATEGORY ID HERE]",
  mapping: "pathname",
  reactionsEnabled: "0",
  emitMetadata: "0",
  inputPosition: "bottom",
  lang: "en",
  loading: "lazy",
};
```

请注意，如果在这里指定了 `theme`，它将覆盖 `lightTheme` 和 `darkTheme` props，导致主题设置变为静态，类似于之前使用 `<script>` 标签嵌入 _Giscus_ 的方式。

要完成整个过程，将新的 Comments 组件添加到 `PostDetails.astro` 中（替换上一步中的 `script` 标签）。

```jsx file=src/layouts/PostDetails.astro
// [!code ++:1]
import Comments from "@/components/Comments";

<ShareLinks />

// [!code ++:1]
<Comments client:only="react" />

<hr class="my-6 border-dashed" />

<Footer />
```

这样就完成了！
