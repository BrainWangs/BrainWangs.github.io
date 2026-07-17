---
lang: zh
author: Simon Smale
pubDatetime: 2024-01-03T20:40:08Z
modDatetime: 2024-01-08T18:59:05Z
title: 如何使用 Git Hooks 设置创建日期和修改日期
featured: false
draft: false
tags:
  - 文档
  - 常见问题
canonicalURL: https://smale.codes/posts/setting-dates-via-git-hooks/
description: 如何在 AstroPaper 中使用 Git Hooks 自动设置创建日期和修改日期
---

在这篇文章中，我将介绍如何使用 pre-commit Git hook 来自动填充 AstroPaper 博客主题 frontmatter 中的创建日期（`pubDatetime`）和修改日期（`modDatetime`）。

## 目录

## 让 Hooks 无处不在

[Git hooks](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks) 非常适合自动化任务，例如将分支名称[添加](https://gist.github.com/SSmale/3b380e5bbed3233159fb7031451726ea)到提交信息中、[检查](https://itnext.io/using-git-hooks-to-enforce-branch-naming-policy-ffd81fa01e5e)分支命名规范，或者[阻止你提交明文密钥](https://gist.github.com/SSmale/367deee757a9b2e119d241e120249000)。它们最大的缺点是客户端 hooks 是每台机器独立的。

你可以通过创建一个 `hooks` 目录并手动将其复制到 `.git/hooks` 目录，或者设置符号链接来解决这个问题，但这都需要你记得去设置，而我不太擅长记住这些事。

由于本项目使用 npm，我们可以利用一个名为 [Husky](https://typicode.github.io/husky/) 的包（AstroPaper 中已经安装）来自动为我们安装 hooks。

> 更新！在 AstroPaper [v4.3.0](https://github.com/satnaing/astro-paper/releases/tag/v4.3.0) 中，pre-commit hook 已被移除，改为使用 GitHub Actions。不过，你可以轻松地自行[安装 Husky](https://typicode.github.io/husky/get-started.html)。

## The Hook

因为我们希望这个 hook 在提交代码时运行，以更新日期并将其作为我们更改的一部分，所以我们将使用 `pre-commit` hook。AstroPaper 项目已经设置好了这个 hook，但如果还没有设置，你可以运行 `npx husky add .husky/pre-commit 'echo "This is our new pre-commit hook"'`。

进入 `hooks/pre-commit` 文件，我们将添加以下一个或两个代码片段。

### 在文件被编辑时更新修改日期

---

更新：

本节已更新为一个更智能的 hook 版本。现在它不会在文章发布之前递增 `modDatetime`。在首次发布时，将草稿状态设置为 `first`，然后见证奇迹的发生。

---

```shell
# Modified files, update the modDatetime
git diff --cached --name-status |
grep -i '^M.*\.md$' |
while read _ file; do
  filecontent=$(cat "$file")
  frontmatter=$(echo "$filecontent" | awk -v RS='---' 'NR==2{print}')
  draft=$(echo "$frontmatter" | awk '/^draft: /{print $2}')
  if [ "$draft" = "false" ]; then
    echo "$file modDateTime updated"
    cat $file | sed "/---.*/,/---.*/s/^modDatetime:.*$/modDatetime: $(date -u "+%Y-%m-%dT%H:%M:%SZ")/" > tmp
    mv tmp $file
    git add $file
  fi
  if [ "$draft" = "first" ]; then
    echo "First release of $file, draft set to false and modDateTime removed"
    cat $file | sed "/---.*/,/---.*/s/^modDatetime:.*$/modDatetime:/" | sed "/---.*/,/---.*/s/^draft:.*$/draft: false/" > tmp
    mv tmp $file
    git add $file
  fi
done
```

`git diff --cached --name-status` 从 git 中获取已暂存准备提交的文件。其输出如下所示：

```shell
A       src/content/blog/setting-dates-via-git-hooks.md
```

开头的字母表示已执行的操作类型，在上面的示例中，该文件是新增的。修改过的文件则标记为 `M`。

我们将该输出通过管道传递给 grep 命令，逐行查找已被修改的文件。该行需要以 `M` 开头（`^(M)`），后面跟任意数量的字符（`.*`），并以 `.md` 文件扩展名结尾（`.(md)$`）。这将过滤掉那些不是已修改 markdown 文件的行 `egrep -i "^(M).*\.(md)$"`。

---

#### 改进 - 更加明确

可以进一步限定只查找 `blog` 目录中的 markdown 文件，因为只有这些文件才具有正确的 frontmatter。

---

正则表达式将捕获两个部分：字母和文件路径。我们将这个列表通过管道传递给一个 while 循环，遍历匹配的行，将字母赋值给 `a`，路径赋值给 `b`。目前我们先忽略 `a`。

要知道文件的草稿状态，我们需要其 frontmatter。在下面的代码中，我们使用 `cat` 获取文件内容，然后使用 `awk` 按 frontmatter 分隔符（`---`）分割文件，并取第二个块（即 frontmatter，位于 `---` 之间的部分）。接着我们再次使用 `awk` 找到 draft 键并打印其值。

```shell
  filecontent=$(cat "$file")
  frontmatter=$(echo "$filecontent" | awk -v RS='---' 'NR==2{print}')
  draft=$(echo "$frontmatter" | awk '/^draft: /{print $2}')
```

现在我们有了 `draft` 的值，接下来会执行以下三种操作之一：将 modDatetime 设置为当前时间（当 draft 为 false 时 `if [ "$draft" = "false" ]; then`），清除 modDatetime 并将 draft 设置为 false（当 draft 设置为 first 时 `if [ "$draft" = "first" ]; then`），或者什么都不做（在其他任何情况下）。

接下来使用 sed 命令的部分对我来说有点神奇，因为我不常用它，这段代码是从[另一篇类似功能的博客文章](https://mademistakes.com/notes/adding-last-modified-timestamps-with-git/)中复制的。本质上，它是在文件的 frontmatter 标签（`---`）内查找 `pubDatetime:` 键，获取整行内容，并将其替换为相同的键加上格式正确的当前日期时间 `pubDatetime: $(date -u "+%Y-%m-%dT%H:%M:%SZ")/"`。

这个替换是在整个文件的上下文中进行的，所以我们将其放入一个临时文件（`> tmp`），然后将新文件移动（`mv`）到旧文件的位置，覆盖它。然后将其添加到 git 中准备提交，就好像是我们自己做了这个更改一样。

---

#### 注意

为了让 `sed` 能够正常工作，frontmatter 中需要已经存在 `modDatetime` 键。为了让应用在日期为空的情况下能够构建，你还需要做一些其他更改，请参见[下文](#empty-moddatetime-changes)。

---

### 为新文件添加日期

为新文件添加日期的过程与上述相同，但这次我们要查找的是已添加的行（`A`），并且要替换 `pubDatetime` 的值。

```shell
# New files, add/update the pubDatetime
git diff --cached --name-status | egrep -i "^(A).*\.(md)$" | while read a b; do
  cat $b | sed "/---.*/,/---.*/s/^pubDatetime:.*$/pubDatetime: $(date -u "+%Y-%m-%dT%H:%M:%SZ")/" > tmp
  mv tmp $b
  git add $b
done
```

---

#### 改进 - 只循环一次

我们可以使用 `a` 变量在循环内部进行切换，在一个循环中完成 `modDatetime` 的更新或 `pubDatetime` 的添加。

---

## 填充 Frontmatter

如果你的 IDE 支持代码片段，可以选择创建一个自定义代码片段来填充 frontmatter。[AstroPaper v4 将默认附带一个适用于 VSCode 的代码片段。](https://github.com/satnaing/astro-paper/pull/206)

<video autoplay muted="muted" controls plays-inline="true" class="border border-skin-line">
  <source src="https://github.com/satnaing/astro-paper/assets/17761689/e13babbc-2d78-405d-8758-ca31915e41b0" type="video/mp4">
</video>

## Empty `modDatetime` 相关更改

为了让 Astro 能够编译 markdown 并正常工作，它需要知道 frontmatter 中应该包含哪些内容。这是通过 `src/content/config.ts` 中的配置来实现的。

为了允许键存在但没有值，我们需要编辑第 10 行，添加 `.nullable()` 函数。

```ts
const blog = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      author: z.string().default(SITE.author),
      pubDatetime: z.date(),
      modDatetime: z.date().optional(), // [!code --]
      modDatetime: z.date().optional().nullable(), // [!code ++]
      title: z.string(),
      featured: z.boolean().optional(),
      draft: z.boolean().optional(),
      tags: z.array(z.string()).default(["others"]),
      ogImage: image().or(z.string()).optional(),
      description: z.string(),
      canonicalURL: z.string().optional(),
      readingTime: z.string().optional(),
    }),
});
```

为了让 IDE 在博客引擎文件中不再报错，我还做了以下更改：

1. 在 `src/layouts/Layout.astro` 的第 15 行添加了 `| null`，使其如下所示：

   ```typescript
   export interface Props {
     title?: string;
     author?: string;
     description?: string;
     ogImage?: string;
     canonicalURL?: string;
     pubDatetime?: Date;
     modDatetime?: Date | null;
   }
   ```

2. 在 `src/components/Datetime.tsx` 的第 5 行添加了 `| null`，使其如下所示：

   ```typescript
   interface DatetimesProps {
     pubDatetime: string | Date;
     modDatetime: string | Date | undefined | null;
   }
   ```
