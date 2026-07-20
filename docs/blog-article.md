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

### `index.md` — 文章正文

文章正文使用 Markdown 编写，支持完整的 GFM 语法、KaTeX 数学公式、代码高亮、GitHub 风格 Callout。

#### 图片

基本语法：

```markdown
![alt 文本](/blogs/slug/image.png)
```

图片默认最大宽度为容器 70%，居中显示。

**设置图片尺寸**：Markdown 原生语法不支持尺寸参数，可使用 HTML `<img>` 标签替代：

```markdown
<!-- 固定像素宽度 -->
<img src="/blogs/slug/image.png" width="500" />

<!-- 百分比宽度 -->
<img src="/blogs/slug/image.png" width="100%" />

<!-- 同时指定宽高 -->
<img src="/blogs/slug/image.png" width="400" height="300" />
```

点击图片可放大预览。

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

## 附加内容（Extras）

附加内容允许将博客文章中的长段推导、详细说明、交互式演示等放到独立页面中，保持主文章简洁。访问路径为 `/blog/{slug}/{extra-name}`。

附加内容分为两种类型：

| 类型 | 存放位置 | 用途 | 示例 |
|------|---------|------|------|
| Markdown 附加文章 | `public/blogs/{slug}/extras/{name}.md` | 数学推导、详细注释等文字内容 | `detailed-math.md` |
| React 组件 | `src/components/extras/{name}.tsx` | Three.js 3D 场景等交互式内容 | `three-demo.tsx` |

### 目录结构

```
public/blogs/文章slug/
├── config.json          ← 在此配置附加文章标题
├── index.md             ← 主文章
├── *.png                ← 图片
└── extras/              ← 附加文章目录
    └── 附加名.md         ← Markdown 附加内容

src/
├── app/blog/[id]/[...extra]/
│   ├── page.tsx          ← 附加内容路由
│   └── registry.ts      ← 组件注册表
└── components/extras/
    └── 组件名.tsx         ← React 附加组件
```

### Markdown 附加文章

#### 创建步骤

1. 在 `public/blogs/{slug}/extras/` 下创建 `.md` 文件，文件名即 URL 中的 extra 名称

2. 在父博客的 `config.json` 中配置标题：

```json
{
  "title": "深度学习基础知识-上",
  "tags": ["深度学习", "MLP"],
  "date": "2026-07-15T23:19",
  "extras": {
    "detailed-math": "卷积输出尺寸的详细推导"
  }
}
```

- `extras` 字段的 key 对应 `.md` 文件名（不含扩展名），value 为显示标题
- 仅 Markdown 附加文章需要在此配置标题，React 组件不需要

3. 在主文章 Markdown 中添加链接：

```markdown
详见 [卷积输出尺寸详细推导](/blog/deeplearning-note-fundamentals-1/detailed-math)
```

#### 标题 fallback 逻辑

附加文章的标题按以下优先级确定：

1. `config.json` 中 `extras[extra-name]` 的值（推荐方式）
2. Markdown 文件的第一个标题（`#` 或 `##`）
3. 文件名（不含扩展名）

### React 附加组件

#### 创建步骤

1. 在 `src/components/extras/` 下创建组件文件，导出接收 `{ blogSlug: string }` props 的 React 组件

2. 在 `src/app/blog/[id]/[...extra]/registry.ts` 中注册：

```ts
import dynamic from 'next/dynamic'

export const extraRegistry: Record<string, ExtraEntry> = {
  'three-demo': {
    type: 'component',
    component: dynamic(() => import('@/components/extras/three-demo'), { ssr: false }),
  },
}
```

- key 为 URL 中的 extra 名称
- 使用 `next/dynamic` 懒加载，`ssr: false` 避免 Three.js 等服务端不可用的库报错

3. 在主文章 Markdown 中添加链接：

```markdown
查看 [3D 交互演示](/blog/deeplearning-note-fundamentals-1/three-demo)
```

#### 组件附加页面行为

与 Markdown 附加文章不同，组件附加页面**不显示**：标题、日期、字数统计、目录、滚动进度条、点赞按钮。只显示返回链接和组件本身。

### 路由解析流程

```
访问 /blog/my-article/detailed-math
        ↓
[ id ] / [ ...extra ] / page.tsx
  params = { id: 'my-article', extra: ['detailed-math'] }
        ↓
extraName = extra.join('/') = 'detailed-math'
        ↓
查 registry.ts → getExtraComponent('detailed-math')
  ├─ 命中（已注册） → 渲染 React 组件
  └─ 未命中          → 作为 Markdown 处理
       ↓
     fetch('/blogs/my-article/extras/detailed-math.md')
     fetch('/blogs/my-article/config.json')  → 取 date + extras 标题
       ↓
     渲染：标题 + 日期 + 字数统计 + 正文 + 侧边栏（TOC/点赞/返回顶部）
```

## 站点配置中影响博客的开关

`src/config/site-content.json` 中的以下字段影响博客行为：

| 字段 | 类型 | 作用 |
|------|------|------|
| `enableCategories` | boolean | 是否启用分类功能（列表页显示"分类"分组模式，编辑器中显示分类选择器） |
| `hideEditButton` | boolean | 是否隐藏博客列表页右上角的"编辑"按钮 |
| `summaryInContent` | boolean | 摘要展示位置（`true` = 正文内，`false` = 侧边栏） |
| `isCachePem` | boolean | 是否在 sessionStorage 中缓存加密后的 Private Key（AES-256-GCM） |
