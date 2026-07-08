# 博客文章系统

## 目录结构

每篇文章对应 `public/blogs/` 下的一个子目录，目录名即为文章的 **slug**（URL 标识符）。

```
public/blogs/
├── index.json          ← 全局文章索引（自动维护）
├── categories.json     ← 分类列表（自动维护）
│
└── 文章slug/           ← 每篇文章一个目录
    ├── config.json     ← 文章元数据
    ├── index.md        ← 文章正文（Markdown）
    └── *.png/webp/jpg  ← 文中引用的图片
```

---

## 文件详解

### `config.json` — 文章元数据

每篇文章目录下必须有一个 `config.json`，定义该文章的元信息。

**类型定义**（`src/app/blog/types.ts`）：

```ts
type BlogConfig = {
  title?: string        // 文章标题（列表页显示）
  tags?: string[]       // 标签数组，如 ["React", "动画"]
  date?: string         // 发布日期，格式 "2025-11-21" 或 "2025-11-21T09:56"
  summary?: string      // 摘要（列表页和 SEO description 使用）
  cover?: string        // 封面图路径，如 "/blogs/liquid-grass/0e7190ecaedc4930.png"
  hidden?: boolean      // 是否隐藏（true = 未登录用户不可见）
  category?: string     // 分类名，如 "开源"、"代码实现"
}
```

**示例**：

```json
{
  "title": "好玩的液态玻璃",
  "tags": ["液态玻璃", "ios"],
  "date": "2025-11-21",
  "summary": "很简单就能实现这个液态玻璃效果，真棒",
  "cover": "/blogs/liquid-grass/0e7190ecaedc4930.png"
}
```

带可选字段的完整示例：

```json
{
  "title": "任务清单软件",
  "tags": ["开发", "开源"],
  "date": "2026-01-23T09:56",
  "summary": "一款极简的任务清单",
  "cover": "/blogs/daily-note/899dca52074bfa0c.webp",
  "hidden": false,
  "category": "开源"
}
```

### `index.json` — 全局文章索引

位于 `public/blogs/index.json`，是所有文章的聚合列表，由前端编辑操作自动维护（若仓库直接添加文章需要手动修改）。

**类型定义**：

```ts
type BlogIndexItem = {
  slug: string          // 文章唯一标识 = 目录名
  title: string
  tags: string[]
  date: string
  summary?: string
  cover?: string
  hidden?: boolean
  category?: string
}
```

与 `config.json` 的唯一区别是多了一个 `slug` 字段。

该文件按日期倒序排列。手动增删文章目录后需要同步更新此文件（或通过前端页面操作自动更新）。

### `categories.json` — 分类列表

```json
{
  "categories": ["代码实现", "总结", "开源"]
}
```

由前端编辑器自动维护，新增分类时自动追加。

## 站点配置中影响博客的开关

`src/config/site-content.json` 中的以下字段影响博客行为：

| 字段 | 类型 | 作用 |
|------|------|------|
| `enableCategories` | boolean | 是否启用分类功能（列表页显示"分类"分组模式，编辑器中显示分类选择器） |
| `hideEditButton` | boolean | 是否隐藏博客列表页右上角的"编辑"按钮 |
| `summaryInContent` | boolean | 摘要展示位置（`true` = 正文内，`false` = 侧边栏） |
| `isCachePem` | boolean | 是否在 sessionStorage 中缓存加密后的 Private Key（AES-256-GCM） |
