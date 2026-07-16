---
title: 如何使用 React 开发我的终端风格个人作品集网站
author: Sat Naing
pubDatetime: 2022-06-09T03:42:51Z
slug: how-do-i-develop-my-terminal-portfolio-website-with-react
featured: false
draft: false
tags:
  - JavaScript
  - ReactJS
  - ContextAPI
  - Styled-Components
  - TypeScript
description:
  "示例文章：使用 ReactJS、TypeScript 和 Styled-Components 开发一个终端风格网站。
  包含自动补全、多主题、命令提示等功能。"
timezone: "Asia/Yangon"
---

> 本文最初来自我的[博客文章](https://satnaing.dev/blog/posts/how-do-i-develop-my-terminal-portfolio-website-with-react)。我将这篇文章放在这里，以展示如何使用 AstroPaper 主题撰写博客文章。

使用 ReactJS、TypeScript 和 Styled-Components 开发一个终端风格网站。包含自动补全、多主题、命令提示等功能。

![Sat Naing 的终端风格作品集](https://satnaing.dev/_ipx/w_2048,q_75/https%3A%2F%2Fres.cloudinary.com%2Fnoezectz%2Fimage%2Fupload%2Fv1654754125%2FSatNaing%2Fterminal-screenshot_gu3kkc.png?url=https%3A%2F%2Fres.cloudinary.com%2Fnoezectz%2Fimage%2Fupload%2Fv1654754125%2FSatNaing%2Fterminal-screenshot_gu3kkc.png&w=2048&q=75)

## 目录

## 前言

最近，我开发并发布了自己的作品集和博客。很高兴收到了一些不错的反馈。今天，我想介绍一下我新做的终端风格作品集网站。它是使用 ReactJS 和 TypeScript 开发的。这个想法来源于 CodePen 和 YouTube。

## 技术栈

这是一个纯前端项目，不包含任何后端代码。UI/UX 部分在 Figma 中设计。在前端用户界面方面，我选择了 React 而非原生 JavaScript 和 NextJS。为什么？

- 首先，我想编写声明式代码。使用命令式的 JavaScript 来操作 HTML DOM 实在太繁琐了。
- 其次，因为它是 React！！！它快速且可靠。
- 最后，我不太需要 NextJS 提供的 SEO 功能、路由和图片优化。

当然还有用于类型检查的 TypeScript。

在样式方面，我采用了与以往不同的方式。我没有选择纯 CSS、Sass 或像 TailwindCSS 这样的工具类 CSS 框架，而是选择了 CSS-in-JS 方案（Styled-Components）。虽然我很早就知道 Styled-Components，但一直没尝试过。因此，这个项目中 Styled-Components 的编写风格和结构可能不太规范或不够好。

这个项目不需要非常复杂的状态管理。我只使用了 ContextAPI 来实现多主题切换，并避免 prop 层层传递。

以下是技术栈的快速回顾。

- 前端：[ReactJS](https://reactjs.org/ "React 官网")、[TypeScript](https://www.typescriptlang.org/ "TypeScript 官网")
- 样式：[Styled-Components](https://styled-components.com/ "Styled-Components 官网")
- UI/UX：[Figma](https://figma.com/ "Figma 官网")
- 状态管理：[ContextAPI](https://reactjs.org/docs/context.html "React ContextAPI")
- 部署：[Netlify](https://www.netlify.com/ "Netlify 官网")

## 功能特性

以下是该项目的一些功能特性。

### 多主题切换

用户可以切换多种主题。在撰写本文时，共有 5 种主题，未来可能还会添加更多。选中的主题会保存在本地存储中，因此页面刷新后主题不会改变。

![切换不同主题](https://i.ibb.co/fSTCnWB/terminal-portfolio-multiple-themes.gif)

### 命令行自动补全

为了让界面尽可能接近真实终端，我加入了命令行自动补全功能，只需按下 "Tab" 或 "Ctrl + i" 即可自动填充部分输入的命令。

![演示命令行自动补全](https://i.ibb.co/CQTGGLF/terminal-autocomplete.gif)

### 历史命令

用户可以通过按上下方向键回到之前输入的命令或浏览历史命令。

![使用上方向键回到历史命令](https://i.ibb.co/vD1pSRv/terminal-up-down.gif)

### 查看/清除命令历史

在命令行中输入 "history" 可以查看之前输入的命令。输入 "clear" 或按 "Ctrl + l" 可以清除所有命令历史和终端屏幕。

![使用 'clear' 或 'Ctrl + L' 命令清除终端](https://i.ibb.co/SJBy8Rr/terminal-clear.gif)

## 结语

这是一个非常有趣的项目。这个项目的特别之处在于，我需要更多地关注逻辑而非用户界面（尽管这算是一个前端项目）。

## 项目链接

- 网站：[https://terminal.satnaing.dev/](https://terminal.satnaing.dev/ "https://terminal.satnaing.dev/")
- 仓库：[https://github.com/satnaing/terminal-portfolio](https://github.com/satnaing/terminal-portfolio "https://github.com/satnaing/terminal-portfolio")
