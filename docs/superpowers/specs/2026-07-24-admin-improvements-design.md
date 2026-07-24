# Admin 路由三项改进设计

日期: 2026-07-24
状态: 已批准

## 背景

AstroPaper 的 admin 路由(`/admin`、`/admin/new`、`/admin/edit`、`/admin/recycle`)目前存在三个体验问题:

1. **标签输入不便** — 编辑页的标签输入是纯文本框,无法看到已有标签,容易重复创建相似标签
2. **中文板块未本地化** — edit.astro 中文板块的标签全是英文(Title、Description、Tags 等)
3. **列表显示问题** — index.astro 日期列显示完整 ISO 时间戳(含时分秒),标题列无宽度限制容易被挤压

## 目标

1. 标签输入支持下拉选择已有标签 + 手动输入新标签,zh/en 独立区分
2. edit.astro 中文板块标签翻译为中文
3. index.astro 日期列只显示年月日(YYYY-MM-DD),标题列扩宽显示

## 设计

### 1. 标签下拉选择器(datalist 模式)

#### 1.1 新增 API 端点: `src/pages/admin/api/tags.ts`

**职责:** 扫描所有文章文件,返回按语言区分的去重标签列表。

**接口:**
```
GET /admin/api/tags

响应 200:
{
  "success": true,
  "data": {
    "zh": ["标签1", "标签2", ...],
    "en": ["tag1", "tag2", ...]
  }
}
```

**实现要点:**
- `export const prerender = false;`(与 posts.ts、post.ts 一致)
- 复用 `_utils/fs.ts` 的 `listAllPosts()` 获取文章列表
- 从每篇文章的 frontmatter 中提取 `tags` 数组
- zh 文章(`zhFrontmatter`)的标签进 `data.zh`,en 文章(`enFrontmatter`)的标签进 `data.en`
- 去重并按字母/拼音排序
- **不调用 `postFilter()`** — 包含草稿文章的标签(管理员需要看到所有标签)
- `if (!import.meta.env.DEV) return 404;`(与其他 admin 端点一致)

**错误处理:**
- 端点失败时返回 `{ success: false, error: <message> }` + 500
- 客户端遇到错误时退化为空 datalist(标签输入仍可用,只是没有提示)

#### 1.2 修改 `src/pages/admin/edit.astro`

**DOM 变更:**

将两处纯文本标签输入框替换为带 datalist 的输入框:

```html
<!-- 中文板块 -->
<label class="block text-xs">标签 (逗号分隔,可下拉选择)</label>
<input id="zh-tags" list="zh-tags-list" type="text" ...>
<datalist id="zh-tags-list"></datalist>

<!-- 英文板块 -->
<label class="block text-xs">Tags (comma-separated, dropdown available)</label>
<input id="en-tags" list="en-tags-list" type="text" ...>
<datalist id="en-tags-list"></datalist>
```

**脚本变更:**

在 `setupEditPage()` 中(通过 `astro:page-load` 触发):

1. 调用 `GET /admin/api/tags` 获取标签列表
2. 清空两个 `<datalist>` 的现有 `<option>` 元素
3. zh 标签 → 添加为 `#zh-tags-list` 的 `<option>`
4. en 标签 → 添加为 `#en-tags-list` 的 `<option>`
5. 失败时静默处理(datalist 保持空,输入退化为普通文本框)

**输入格式不变:** 逗号分隔,与现有 `buildFrontmatter()` 解析逻辑完全兼容,无需修改提交逻辑。

#### 1.3 修改 `src/pages/admin/new.astro`

**DOM 变更:**

在文件选择区(zh/en 各一个)下方增加标签输入区:

```html
<!-- 在 #zh-preview 之后 -->
<div class="mt-3">
  <label class="block text-xs">标签 (逗号分隔,可下拉选择或输入新标签)</label>
  <input id="zh-tags" list="zh-tags-list" type="text"
    class="bg-background border-border w-full rounded border p-1.5 text-sm"
    placeholder="标签1, 标签2">
  <datalist id="zh-tags-list"></datalist>
</div>

<!-- 同样为 en 板块添加 -->
```

**脚本变更:**

1. 在 `setupNewPostPage()` 中调用 `GET /admin/api/tags` 填充 datalist
2. 文件解析后(`setupFilePreview` 的 change 回调中),从 frontmatter.tags 预填到标签输入框:
   - 如果文件 frontmatter 有 tags 数组,用 `, ` 连接填入输入框
   - 用户可在发布前修改
3. 提交时(`submit-btn` click handler),如果用户在标签输入框中输入了内容,覆盖文件中的标签:
   - 输入框非空 → 用输入框的标签(解析逗号分隔)
   - 输入框为空 → 保留文件中的标签(回退到原行为)

**优先级规则:** 用户输入 > 文件 frontmatter

### 2. edit.astro 中文板块翻译

仅翻译中文板块的 UI 标签,英文板块保持英文:

| 当前 (英文) | 翻译后 (中文板块) |
|------------|-----------------|
| Title | 标题 |
| pubDatetime | 发布时间 |
| Description | 描述 |
| Tags (comma-separated) | 标签 (逗号分隔,可下拉选择) |
| Options | 选项 |
| Draft | 草稿 |
| Featured | 精选 |
| Content (Markdown) | 正文 (Markdown) |
| Toggle Preview | 切换预览 |

状态文字:
- `exists` → `已存在`
- `not created` → `未创建`

**英文板块保持不变** — 因为这是面向英文内容的板块,英文标签更符合上下文。

### 3. index.astro 日期格式与标题宽度

#### 3.1 日期格式

当前代码:
```javascript
const date = (post.zhFrontmatter as Record<string, unknown>)?.pubDatetime ||
             (post.enFrontmatter as Record<string, unknown>)?.pubDatetime ||
             "—";
```

改为:
```javascript
const rawDate = (post.zhFrontmatter as Record<string, unknown>)?.pubDatetime ||
                (post.enFrontmatter as Record<string, unknown>)?.pubDatetime;
const date = typeof rawDate === "string" ? rawDate.slice(0, 10) : "—";
// "2024-01-15T04:05:06Z" → "2024-01-15"
```

#### 3.2 标题列宽度

当前:
```html
<td class="p-2">${title}</td>          <!-- 无宽度限制 -->
<td class="p-2 max-w-[200px] truncate font-mono text-xs">${slug}</td>  <!-- slug 200px -->
```

改为:
```html
<td class="p-2 max-w-[400px] truncate">${title}</td>
<td class="p-2 max-w-[160px] truncate font-mono text-xs">${slug}</td>
```

- 标题列 `max-w-[400px]` + `truncate`:扩宽显示,超长用省略号
- slug 列缩为 `max-w-[160px]`:给标题腾出空间

## 错误处理

- `/admin/api/tags` 失败时,datalist 为空,标签输入退化为普通文本框,不影响功能
- 标签解析仍用现有逗号分隔逻辑,空标签自动过滤(`.filter(Boolean)`)
- new.astro 中文件无 frontmatter 或无 tags 字段时,标签输入框为空(不报错)

## 测试策略

扩展 `tests_admin/test_view_transitions_fix.py`:

1. **`/admin/api/tags` 端点验证:**
   - GET 返回 200 + `{ success: true, data: { zh: [...], en: [...] } }`
   - zh 数组只包含中文文章的标签,en 数组只包含英文文章的标签
   - 数组已去重并排序

2. **edit.astro datalist 验证:**
   - `#zh-tags` 输入框有 `list="zh-tags-list"` 属性
   - `#en-tags` 输入框有 `list="en-tags-list"` 属性
   - datalist 中有 `<option>` 子元素(数量 > 0 当存在文章时)

3. **new.astro 标签预填验证:**
   - 选择含 frontmatter 的 .md 文件后,`#zh-tags` 输入框显示文件中的标签
   - 用户修改输入框后,提交时使用输入框的值(覆盖文件值)

4. **index.astro 显示验证:**
   - 日期列文本匹配 `^\d{4}-\d{2}-\d{2}$` 或为 `—`
   - 标题列元素有 `max-w-[400px]` 和 `truncate` class

5. **中文翻译验证:**
   - edit.astro 中文板块可见"标题"、"发布时间"、"描述"等中文标签
   - 英文板块仍显示"Title"、"pubDatetime"、"Description"

## 影响范围

**新增文件:**
- `src/pages/admin/api/tags.ts`

**修改文件:**
- `src/pages/admin/edit.astro`(datalist + 中文翻译)
- `src/pages/admin/new.astro`(datalist + 标签预填)
- `src/pages/admin/index.astro`(日期格式 + 标题宽度)

**不修改:**
- `src/pages/admin/api/posts.ts`(POST 创建逻辑不变)
- `src/pages/admin/api/post.ts`(PUT 更新逻辑不变,frontmatter 合并逻辑已支持 tags)
- `src/pages/admin/_utils/*`(fs、types、frontmatter 工具不变)
- `src/pages/admin/recycle.astro`(无标签编辑需求)

## YAGNI 检查

- **不做** 标签自动补全/搜索过滤(用原生 datalist 即可)
- **不做** 标签颜色/分类
- **不做** 标签使用统计
- **不做** 标签删除/重命名(超出本次范围)
- **不做** 标签的 i18n 翻译(标签本身是用户内容,不翻译)
