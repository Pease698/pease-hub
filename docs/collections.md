# 专栏（Collections）

> 站内显示名为**我的专栏**（首页 GENERAL 导航）。代码与 URL 仍沿用 `collections`：`/collections`、`collections.json`、`CollectionItem`、`src/lib/collections.ts` 等，二者是同一概念，改名只涉及显示文案。

专栏用于承载**长期维护、持续追加、非时间线**的系列内容，例如「论文阅读汇总」「leetcode 刷题记录」。

普通文章（`/blog`）是"近期文章"的时间流；专栏是独立入口，两者互不混排。

## 目录结构

```
public/blogs/
├── index.json                       # 普通文章索引（专栏不在这里）
├── categories.json                  # 普通文章分类
├── collections.json                 # 专栏注册表（专栏元信息 + 成员文章 slug，手工维护）
├── collection-articles.json         # ★ 构建期生成的扁平索引：全部专栏文章的元信息（1 次请求即可取全）
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

### 两套索引的分工

| 文件 | 维护方式 | 用途 |
|------|---------|------|
| `collections.json` | **手工**：专栏元信息 + 成员 slug 列表 | 成员关系、专栏卡片、"N 篇"计数 |
| `collection-articles.json` | **自动生成**（`scripts/gen-collections-index.js`） | 前端读取全部专栏文章元信息（标题/日期/标签/摘要/封面） |

生成脚本会顺带做**封面回退**：专栏文章没有自己的封面时，采用所属专栏的封面。`pnpm dev` / `pnpm build` / `pnpm build:cf` 都会先自动执行它；也可手动 `pnpm collections:index`。
**因此新增或修改专栏文章后，记得让它跑一次**（正常走 `pnpm build` / `pnpm dev` 即可；若只改文件不重启，索引会是旧的）。

## 路由

| 路由 | 页面 | 数据 |
|------|------|------|
| `/collections` | 专栏列表（卡片） | `public/blogs/collections.json` |
| `/collections/{collection}` | 专栏主页：封面 + 介绍 + 按时间串联的文章目录 | `collections.json` + `collection-articles.json` + `{collection}/index.md` |
| `/collections/{collection}/{article}` | 专栏文章正文 | `{collection}/articles/{article}/`（该文章自己的 `config.json` + `index.md`） |

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

## 检索（搜索入口 + 独立搜索页）

检索**不在**专栏列表页上直接展开，而是分成两步，目的是让首屏不为"可能用不到的标签云"付出代价：

| 路由 | 加载的数据 | 说明 |
|------|-----------|------|
| `/collections` | 只加载 `collections.json`（**1 个请求**） | 专栏卡片网格 + 一个搜索框样式的**入口按钮** |
| `/collections/search` | 进入本页才 `loadAllCollectionArticles()`（读取生成的扁平索引，**1 个请求**） | 搜索态：全部标签 + **默认列出全部文章**作为初始结果 |

- 入口按钮是个链接（不是真实 `<input>`）——能聚焦却打不了字的输入框容易被误认为坏了
- 入口是否显示，只依据 `collections.json` 里各专栏的 `articles` 总数判断，**不触发额外请求**
- 进入搜索页后：自动聚焦输入框；`Esc` 或左上角「返回专栏列表」可退出
- `loadAllCollectionArticles()` 有**模块级缓存**，第二次进入搜索页不会再发请求
- **注意**：`/collections/search` 是静态路由，会**遮蔽同名专栏**——请勿把专栏 slug 命名为 `search`

检索条件两个，同时生效：

| 条件 | 行为 |
|------|------|
| 关键词 | 匹配子文章**标题**（含即命中，忽略大小写）；留空则不筛选 |
| 标签 | 由**所有专栏文章**的 tags 汇总而成，可多选；多选时需**同时包含**（AND）；不选则不筛选 |

交互细节：

- 每个标签 chip 上的数字是「当前关键词 + 当前已选标签 + 该标签」下的候选命中数
- 会让结果归零且未选中的标签会**置灰禁用**——这是 AND 语义下避免"点了就空"的关键
- 结果列表：日期 · 时间线 · 标题 · 所属专栏徽标 · tags，整行可点，已读显示 `[已阅读]`
- 计数行常显：未筛选时「共 N 篇」，有筛选时「命中 N 篇」
- 纯前端内存过滤，无后端与索引服务；**筛选条件不写入 URL**（刷新即回到无筛选、仍列出全部文章）
- 全部专栏文章的元信息来自构建期生成的 `collection-articles.json`，**1 个请求**取全，不随文章数增长

## 新增一篇专栏文章

1. 新建目录 `public/blogs/{collection}/articles/{article-slug}/`
2. 写入 `config.json`（`title` 必填；`tags` / `date` / `summary` / `cover` 可选）
3. 写入 `index.md`（正文，图片建议放在同目录下并用**绝对路径**引用，例如 `/blogs/leetcode/articles/xxx/pic/1.png`）
4. 在 `public/blogs/collections.json` 中该专栏的 `articles` 数组里追加这篇的 **slug 字符串**：

```json
"articles": ["2026-08-01_two-sum", "2026-08-05_intersection-of-two-linked-lists"]
```

专栏注册表里**只登记 slug**（表示"这篇文章属于该专栏"）；文章的**标题、日期、标签全部来自它自己的 `config.json`**，专栏页按各文章的 `date` 倒序串联展示，不需要在 `collections.json` 里手工排序或分组。

5. 让索引重新生成一次：`pnpm collections:index`，或直接 `pnpm dev` / `pnpm build`（都会自动执行）。**忘了这步的话，页面读到的仍是旧的 `collection-articles.json`。**

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
- **sitemap / RSS**：`src/app/sitemap.ts` 与 `src/app/rss.xml/route.ts` 会读取 `collections.json` 与各文章 `config.json`（构建期直接读文件），把专栏主页和专栏文章一并收录。
- **首页信息流**：`最新文章` 与 `随机推荐` 两张卡片通过 `src/hooks/use-article-feed.ts` 把**普通文章与专栏文章合并**后再取最新 / 随机，因此专栏文章会出现在首页；专栏侧读的是 `collection-articles.json`（1 个请求，模块级缓存）。专栏文章的封面**回退为所属专栏的封面**（生成脚本已写入索引）。
- **旧链接重定向**：专栏内容此前寄存在 `extras/` 下，旧地址会 301 到新地址：
  - `/blog/{collection}` → `/collections/{collection}`
  - `/blog/{collection}/{article}` → `/collections/{collection}/{article}`
- **`extras` 机制仍然保留**：它用于给**普通文章**挂补充内容（例如 `machine-learning-1` 的目录、公式推导），与专栏是两套东西。

## 相关代码

| 文件 | 作用 |
|------|------|
| `public/blogs/collections.json` | 专栏注册表（手工维护：元信息 + 成员 slug） |
| `public/blogs/collection-articles.json` | 全部专栏文章元信息的扁平索引（**自动生成**，前端 1 次请求取全） |
| `scripts/gen-collections-index.js` | 生成上面那份索引，并做封面回退（无自有封面时用专栏封面） |
| `src/lib/collections.ts` | 注册表与扁平索引的读取缓存、专栏文章 key；检索算法复用 `@/lib/tag-filter` |
| `src/lib/load-blog.ts` | `loadBlog`（普通文章）/ `loadCollectionArticle`（专栏文章正文） |
| `src/app/collections/page.tsx` | 专栏列表（只加载注册表）+ 搜索入口 |
| `src/app/collections/search/page.tsx` | 搜索页：进入时才加载全部文章与标签 |
| `src/app/collections/components/collection-search-entry.tsx` | 搜索入口按钮（搜索框外观的链接） |
| `src/lib/tag-filter.ts` | 检索纯算法（**与文章搜索共用**）：`collectTags` / `filterByKeywordAndTags` / `collectTagOptions` |
| `src/components/tag-search-controls.tsx` | 检索控件（**与文章搜索共用**）：关键词输入 + 多选标签 chips + 命中数 |
| `src/components/article-result-list.tsx` | 结果行列表（**与文章搜索共用**，专栏传 `badge` 显示专栏名） |
| `src/app/collections/[collection]/page.tsx` | 专栏主页 |
| `src/app/collections/[collection]/[article]/page.tsx` | 专栏文章正文 |
| `src/components/nav-card.tsx` | 首页 GENERAL 导航中的「我的专栏」入口 |
