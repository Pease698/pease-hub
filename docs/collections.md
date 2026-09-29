# 专栏（Collections）

> 站内显示名为**我的专栏**（首页 GENERAL 导航）。代码与 URL 仍沿用 `collections`：`/collections`、`collections.json`、`CollectionItem`、`src/lib/collections.ts` 等，二者是同一概念，改名只涉及显示文案。

专栏用于承载**长期维护、持续追加、非时间线**的系列内容，例如「论文阅读汇总」「leetcode 刷题记录」。

普通文章（`/blog`）是"近期文章"的时间流；专栏是独立入口，两者互不混排。

## 目录结构

```
public/blogs/
├── index.json                       # 普通文章索引（专栏不在这里）
├── categories.json                  # 普通文章分类
├── collections.json                 # 专栏注册表（专栏元信息 + 成员文章 slug）
├── paper-reading/                   # 一个专栏
│   ├── index.md                     # 专栏介绍（渲染在专栏主页正文位置）
│   ├── cover.jpeg                   # 专栏封面
│   └── articles/                    # 专栏内文章，一篇一个目录
│       ├── 2026-07-20_review2024/
│       │   ├── config.json          # title / tags / date / summary / cover
│       │   └── index.md             # 正文
│       └── 2026-07-20_CAMEL/
│           ├── config.json
│           ├── index.md
│           └── pic/                 # 该文章自己的图片
└── leetcode/
    └── articles/...
```

**每篇专栏文章都是一个"普通文章"目录**：结构、`config.json`、`index.md` 与 `public/blogs/{slug}/` 完全一致，只是多了一层 `{collection}/articles/`。

## 路由

| 路由 | 页面 | 数据 |
|------|------|------|
| `/collections` | 专栏列表（卡片） | `public/blogs/collections.json` |
| `/collections/{collection}` | 专栏主页：封面 + 介绍 + 按时间串联的文章目录 | `collections.json` + `{collection}/index.md` + 各文章 `config.json` |
| `/collections/{collection}/{article}` | 专栏文章正文 | `{collection}/articles/{article}/` |

## 渲染方式

专栏文章页与普通文章页**共用同一个渲染组件** `src/components/blog-preview.tsx` 的 `<BlogPreview>`：

- `src/app/blog/[id]/page.tsx` → `<BlogPreview>`（普通文章）
- `src/app/collections/[collection]/[article]/page.tsx` → `<BlogPreview>`（专栏文章）

因此标题、标签、日期、字数统计、正文、目录（TOC）、摘要、点赞按钮的表现完全一致。两处**刻意**的差异：

- 专栏子文章**不渲染封面**（不向 `BlogPreview` 传 `cover`），普通文章才渲染封面
- 专栏子文章右上角多一个「返回专栏」入口

> 请勿在专栏文章页复制一份新的正文渲染逻辑——只调用 `BlogPreview` 即可保持长期一致。

## 专栏主页

- **顶栏**：左侧封面按原始比例展示（不裁切），卡片高度由封面高度与右侧标题/说明文字共同撑开，两者都完整可见
- **目录**：按各子文章 `config.json` 的 `date` 倒序串联（最新的在最前），每行与 `/blog` 列表一致：日期 · 时间线圆点 · 标题 · 右侧 tags 标签；已读的文章显示 `[已阅读]`
- 专栏自身不再带 tags（标签只属于子文章）

## 新增一篇专栏文章

1. 新建目录 `public/blogs/{collection}/articles/{article-slug}/`
2. 写入 `config.json`（`title` 必填；`tags` / `date` / `summary` / `cover` 可选）
3. 写入 `index.md`（正文，图片建议放在同目录下并用**绝对路径**引用，例如 `/blogs/leetcode/articles/xxx/pic/1.png`）
4. 在 `public/blogs/collections.json` 中该专栏的 `articles` 数组里追加这篇的 **slug 字符串**：

```json
"articles": ["2026-08-01_two-sum", "2026-08-05_intersection-of-two-linked-lists"]
```

专栏注册表里**只登记 slug**（表示"这篇文章属于该专栏"）；文章的**标题、日期、标签全部来自它自己的 `config.json`**，专栏页按各文章的 `date` 倒序串联展示，不需要在 `collections.json` 里手工排序或分组。

## 新增一个专栏

1. 新建目录 `public/blogs/{collection}/`，放入 `index.md`（介绍）与 `cover.*`
2. 在 `public/blogs/collections.json` 追加一项：

```json
{
	"slug": "new-collection",
	"title": "新专栏",
	"summary": "一句话介绍",
	"cover": "/blogs/new-collection/cover.png",
	"date": "2026-09-01T10:00",
	"articles": []
}
```

3. 按上面的步骤往 `articles` 里追加文章

导航入口 `/collections` 会自动列出所有专栏，无需改动代码。

## 其他行为

- **点赞**：以 `{collection}/{article}` 为 key（`src/lib/collections.ts` 的 `collectionArticleKey`），每篇文章独立计数。
- **已读标记**：同样以 `{collection}/{article}` 为 key 记录，在专栏主页目录中显示 `[已阅读]`。
- **sitemap / RSS**：`src/app/sitemap.ts` 与 `src/app/rss.xml/route.ts` 会读取 `collections.json` 与各文章 `config.json`，把专栏主页和专栏文章一并收录。
- **旧链接重定向**：专栏内容此前寄存在 `extras/` 下，旧地址会 301 到新地址：
  - `/blog/{collection}` → `/collections/{collection}`
  - `/blog/{collection}/{article}` → `/collections/{collection}/{article}`
- **`extras` 机制仍然保留**：它用于给**普通文章**挂补充内容（例如 `machine-learning-1` 的目录、公式推导），与专栏是两套东西。

## 相关代码

| 文件 | 作用 |
|------|------|
| `public/blogs/collections.json` | 专栏注册表 |
| `src/lib/collections.ts` | 注册表读取与缓存、专栏文章 key |
| `src/lib/load-blog.ts` | `loadBlog`（普通文章）/ `loadCollectionArticle`（专栏文章） |
| `src/app/collections/page.tsx` | 专栏列表 |
| `src/app/collections/[collection]/page.tsx` | 专栏主页 |
| `src/app/collections/[collection]/[article]/page.tsx` | 专栏文章正文 |
| `src/components/nav-card.tsx` | 首页 GENERAL 导航中的「专栏」入口 |
