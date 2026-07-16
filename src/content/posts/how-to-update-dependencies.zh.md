---
title: 如何更新 AstroPaper 的依赖
author: Sat Naing
pubDatetime: 2023-07-20T15:33:05.569Z
slug: how-to-update-dependencies
featured: false
draft: false
ogImage: ../../assets/images/forrest-gump-quote.png
tags:
  - 常见问题
description: 如何更新项目依赖和 AstroPaper 模板。
---

更新项目的依赖可能是一件繁琐的事情。然而，忽视项目依赖的更新也不是一个好主意 😬。在这篇文章中，我将分享我通常如何更新我的项目，以 AstroPaper 为例。不过，这些步骤同样适用于其他 js/node 项目。

![Forrest Gump Fake Quote](@/assets/images/forrest-gump-quote.png)

## 目录

## 更新包依赖

更新依赖有几种方法，我尝试过各种方式来找到最简单的途径。一种方法是使用 `npm install package-name@latest` 手动更新每个包。这种方法是最直接的更新方式。然而，它可能不是最高效的选择。

我推荐的更新依赖的方式是使用 [npm-check-updates 包](https://www.npmjs.com/package/npm-check-updates)。freeCodeCamp 上有一篇很好的[文章](https://www.freecodecamp.org/news/how-to-update-npm-dependencies/)介绍了它，所以我不会详细解释它是什么以及如何使用那个包。相反，我将向你展示我的典型做法。

首先，全局安装 `npm-check-updates` 包。

```bash
npm install -g npm-check-updates
```

在进行任何更新之前，最好先检查所有可以更新的新依赖。

```bash
ncu
```

大多数情况下，补丁依赖可以在完全不影响项目的情况下进行更新。因此，我通常通过运行 `ncu -i --target patch` 或 `ncu -u --target patch` 来更新补丁依赖。区别在于 `ncu -u --target patch` 会更新所有补丁，而 `ncu -i --target patch` 会提供选项让你选择更新哪个包。你可以自行决定采用哪种方式。

接下来是更新次版本依赖。次版本包更新通常不会破坏项目，但最好还是查看相应包的发布说明。这些次版本更新通常包含一些可以应用到我们项目中的不错的功能。

```bash
ncu -i --target minor
```

最后但同样重要的是，依赖中可能还有一些主版本包更新。因此，通过运行以下命令来检查剩余的依赖更新：

```bash
ncu -i
```

如果还有任何主版本更新（或你仍需进行的一些更新），上述命令将输出那些剩余的包。如果包是主版本更新，你必须非常小心，因为这很可能会破坏整个项目。因此，请非常仔细地阅读相应的发布说明或文档，并做出相应的调整。

如果你运行 `ncu -i` 后发现没有更多需要更新的包，_**恭喜！！！**_ 你已经成功更新了项目中的所有依赖。

## 更新 AstroPaper 模板

与其他开源项目一样，AstroPaper 也在不断演进，包括 bug 修复、功能更新等。因此，如果你正在使用 AstroPaper 作为模板，你可能也想要在有新版本发布时更新模板。

问题是，你可能已经根据自己的喜好对模板进行了修改。因此，我无法确切地展示**"一刀切的完美方式"**来将模板更新到最新版本。不过，这里有一些技巧可以帮助你在不破坏你的仓库的情况下更新模板。请记住，大多数情况下，更新包依赖可能对你来说已经足够了。

### 需要注意的文件和目录

在大多数情况下，你可能不想覆盖的文件和目录（因为你可能已经更新了这些文件）是 `src/content/blog/`、`src/config.ts`、`src/pages/about.md`，以及其他资源和样式，如 `public/` 和 `src/styles/base.css`。

如果你只对模板做了最低限度的修改，那么除了上述文件和目录之外，用最新的 AstroPaper 替换所有内容应该是可以的。这就像原生 Android 系统和其他厂商特定的系统如 OneUI 一样。你对基础修改得越少，需要更新的就越少。

你可以手动逐个替换每个文件，也可以使用 git 的魔力来更新所有内容。我不会展示手动替换的过程，因为它非常直接。如果你对这种直接但低效的方法不感兴趣，请耐心听我说 🐻。

### 使用 Git 更新 AstroPaper

**重要！！！**

> 只有在你了解如何解决合并冲突的情况下才执行以下操作。否则，你最好手动替换文件或仅更新依赖。

首先，将 astro-paper 添加为你项目中的远程仓库。

```bash
git remote add astro-paper https://github.com/satnaing/astro-paper.git
```

切换到一个新分支来更新模板。如果你知道自己在做什么并且对自己的 git 技能有信心，可以省略此步骤。

```bash
git checkout -b build/update-astro-paper
```

然后，通过运行以下命令从 astro-paper 拉取更改：

```bash
git pull astro-paper main
```

如果你遇到 `fatal: refusing to merge unrelated histories` 错误，可以通过运行以下命令来解决：

```bash
git pull astro-paper main --allow-unrelated-histories
```

运行上述命令后，你很可能会在项目中遇到冲突。你需要手动解决这些冲突，并根据你的需求进行必要的调整。

解决冲突后，请彻底测试你的博客，确保一切按预期工作。检查你的文章、组件以及你所做的任何自定义修改。

当你对结果满意后，就可以将更新分支合并到你的主分支了（仅当你在另一个分支中更新模板时才需要这样做）。恭喜！你已经成功将模板更新到最新版本。你的博客现在已经是最新的，准备大放异彩！🎉

## 结语

在这篇文章中，我分享了一些关于更新依赖和 AstroPaper 模板的见解和流程。我真诚地希望这篇文章对你有所帮助，并能协助你更高效地管理你的项目。

如果你有任何更新依赖/AstroPaper 的替代或改进方法，我很乐意听取你的意见。因此，请随时在仓库中发起讨论、给我发邮件或提交 issue。你的反馈和想法非常宝贵！

请理解我最近日程相当繁忙，可能无法快速回复。但我保证会尽快回复你。😬

感谢你花时间阅读这篇文章，祝你的项目一切顺利！
