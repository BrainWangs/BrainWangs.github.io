---
title: 我是如何开发我的作品集网站和博客的
author: Sat Naing
pubDatetime: 2022-03-25T16:55:12.000+00:00
slug: how-do-i-develop-my-portfolio-and-blog
featured: false
draft: false
tags:
  - NextJS
  - TailwindCSS
  - 无头CMS
  - 博客
description:
  "示例文章：我使用 NextJS 和无头 CMS 开发第一个作品集网站和博客的经历。"
timezone: "Asia/Yangon"
---

> 本文最初来自我的[博客文章](https://satnaing.dev/blog/posts/how-do-i-develop-my-portfolio-and-blog)。我将这篇文章放在这里，以演示如何使用 AstroPaper 主题编写博客文章。

我使用 NextJS 和无头 CMS 开发第一个作品集网站和博客的经历。

![构建作品集](https://satnaing.dev/_ipx/w_2048,q_75/https%3A%2F%2Fres.cloudinary.com%2Fnoezectz%2Fimage%2Fupload%2Fv1653050141%2FSatNaing%2Fblog_at_cafe_ei1wf4.jpg?url=https%3A%2F%2Fres.cloudinary.com%2Fnoezectz%2Fimage%2Fupload%2Fv1653050141%2FSatNaing%2Fblog_at_cafe_ei1wf4.jpg&w=2048&q=75)

## 动机

从大学时代起，我就一直想着用我自己的自定义域名（**satnaing.dev**）上线自己的网站。但直到这个项目之前，这个想法从未实现。我做过不少关于 Web 应用开发的项目和工作，但却一直没有花精力来做这件事。

那么你可能会问："博客呢？"是的，博客也在我的项目清单里有一段时间了。我一直想用一些最新的技术做一个博客项目。然而，我一直忙于工作和其他项目，所以博客项目始终没有启动。

最近，我倾向于以注重质量而非数量的方式来开发自己的项目。项目完成后，我通常会在 GitHub 仓库中放一个像样的 readme 文件。但 GitHub 仓库的 readme 只适合技术层面（这只是我个人的想法）。我想要记录下我的经验和遇到的挑战。因此，我决定创建自己的博客。此外，到了这个阶段，我已经有了足够的经验和信心来开发这个项目。

## 技术栈

对于前端，我想使用 [React](https://reactjs.org/ "React 官方网站")。但 React 本身对 SEO 不够友好；而且我还需要考虑路由、图片优化等诸多因素。所以，我选择了 [NextJS](https://nextjs.org/ "NextJS 官方网站") 作为我的主要前端框架，当然还有 TypeScript 来做类型检查。（据说一旦你习惯了 TypeScript，你就会爱上它 😉）

在样式方面，我使用了 [TailwindCSS](https://tailwindcss.com/ "Tailwind CSS 官方网站")。这是因为我喜欢 Tailwind 带来的开发者体验，而且与 MUI 或 React Bootstrap 等其他组件 UI 库相比，它提供了极大的灵活性。

这个项目的所有内容都存放在 GitHub 仓库中。我所有的博客文章（包括这篇）都是用 Markdown 文件格式编写的，因为我对这种方式非常熟悉。但为了能轻松地编写 Markdown 及其 frontmatter，我使用了 [Forestry](https://forestry.io/ "Forestry 官方网站") 无头 CMS。它是一个基于 Git 的 CMS，可以管理 Markdown 和其他内容。得益于此，我既可以用 Markdown 编辑内容，也可以用所见即所得的编辑器。此外，用它来编写 frontmatter 也毫不费力。

图片和资源上传并存储在 [Cloudinary](https://cloudinary.com/ "Cloudinary 官方网站") 上。我通过 Forestry 连接 Cloudinary，直接在后台管理面板中管理它们。

总结一下，以下是这个项目使用的技术栈。

- 前端：NextJS（TypeScript）
- 样式：TailwindCSS
- 动画：GSAP
- CMS：Forestry 无头 CMS
- 部署：Vercel

## 功能特性

以下是我的作品集和博客的一些功能特性。

### SEO 友好

整个项目在开发时就以 SEO 为核心考量。我使用了合适的 meta 标签、描述和标题层级。这个网站现在已经被 Google 收录了。

> 你可以通过 'sat naing dev' 这样的关键词在 Google 上搜索到这个网站

![在 Google 上搜索 satnaing.dev](https://res.cloudinary.com/noezectz/image/upload/v1648231400/SatNaing/satnaing-on-google_asflq6.png "satnaing.dev 已被收录")

此外，由于正确使用了 meta 标签，这个网站在分享到社交媒体时也能良好地展示。

![分享到 Facebook 时 satnaing.dev 的卡片布局](https://res.cloudinary.com/noezectz/image/upload/v1653106955/SatNaing/satnaing-dev-share-on-facebook_1_zjoehx.png "分享到 Facebook 时的卡片布局")

### 动态站点地图

站点地图在 SEO 中扮演着重要角色。因此，网站的每一个页面都应该包含在 sitemap.xml 中。每当创建新内容、新标签或新分类时，我的网站都会自动生成站点地图。

### 浅色与深色主题

由于近年来深色主题的流行趋势，如今许多网站都内置了深色主题。当然，我的网站也支持浅色和深色主题。

### 完全无障碍

这个网站是完全无障碍的。你可以仅使用键盘来浏览整个网站。我遵循了所有无障碍最佳实践，包括为所有图片添加 alt 文本、不跳级使用标题、使用语义化 HTML 标签、正确使用 aria 属性等。

### 搜索框、分类与标签

所有博客内容都可以通过搜索框进行搜索。此外，内容还可以按分类和标签进行筛选。这样，博客读者就能搜索和阅读他们真正想看的内容。

### 性能与 Lighthouse 评分

得益于规范的开发和最佳实践，这个网站获得了非常好的性能和 Lighthouse 评分。以下是这个网站的 Lighthouse 评分。

![satnaing.dev Lighthouse 评分](https://user-images.githubusercontent.com/53733092/159957822-7082e459-11e9-4616-8f1e-49d0881f7cbb.png "satnaing.dev Lighthouse 评分")

### 动画

最初我使用 [Framer Motion](https://www.framer.com/motion/ "Framer Motion") 来为这个网站添加动画和微交互。然而，当我尝试使用一些复杂的动画和视差效果时，我发现与 Framer Motion 集成不太方便（也许是我还不够熟练）。因此，我决定使用 [GSAP](https://greensock.com/ "GSAP 动画库") 来处理所有的动画。它是最流行的动画库之一，能够实现复杂和高级的动画效果。你几乎可以在这个网站的每个页面上看到动画和微交互。

![satnaing.dev 上的动画效果](https://res.cloudinary.com/noezectz/image/upload/v1653108324/SatNaing/ezgif.com-gif-maker_2_hehtlm.gif "satnaing.dev 网站")

## 结语

总的来说，这个项目在开发博客网站（SSG）方面给了我很多经验和信心。如今，我已经掌握了基于 Git 的 CMS 的知识，以及它与 NextJS 的交互方式。我还学习了 SEO、动态站点地图生成和 Google 收录的相关流程。未来我会做出更好的项目，敬请期待！✌🏻

最后但同样重要的是，我想感谢我的朋友 [Swann Fevian Kyaw](https://www.facebook.com/bon.zai.3910 "Swann Fevian Kyaw 的 Facebook 账号")（@[ToonHa](https://www.facebook.com/ToonHa-102639465752883 "ToonHa Facebook 主页")），他为我网站的 hero 区域画了一幅精美的插画。

## 项目链接

- 网站：[https://satnaing.dev/](https://satnaing.dev/ "https://satnaing.dev/")
- 博客：[https://satnaing.dev/blog](https://satnaing.dev/blog "https://satnaing.dev/blog")
- 仓库：[https://github.com/satnaing/my-portfolio](https://github.com/satnaing/my-portfolio "https://github.com/satnaing/my-portfolio")
