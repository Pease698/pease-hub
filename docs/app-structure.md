# 源代码目录结构

## `src/app/` — 页面路由

Next.js App Router 约定，每个子目录自动映射为一个 URL 路径。

### 概览

| 目录 | URL | 用途 | 内容驱动方式 |
|------|-----|------|-------------|
| [(home)/](src/app/(home)/) | `/` | 首页 | 配置文件 |
| [blog/](src/app/blog/) | `/blog` | 博客列表 | `public/blogs/index.json` |
| [blog/[id]/](src/app/blog/%5Bid%5D/) | `/blog/{slug}` | 博客详情 | `public/blogs/{slug}/` |
| [collections/](src/app/collections/) | `/collections` | 专栏列表 | `public/blogs/collections.json` |
| [collections/search/](src/app/collections/search/) | `/collections/search` | 跨专栏检索 | 各专栏文章 `config.json` |
| [collections/[collection]/](src/app/collections/%5Bcollection%5D/) | `/collections/{collection}` | 专栏主页 | `public/blogs/{collection}/index.md` |
| [collections/[collection]/[article]/](src/app/collections/%5Bcollection%5D/%5Barticle%5D/) | `/collections/{collection}/{article}` | 专栏文章 | `public/blogs/{collection}/articles/{article}/` |
| [write/](src/app/write/) | `/write` | 文章编辑器 | — |
| [write/[slug]/](src/app/write/%5Bslug%5D/) | `/write/{slug}` | 编辑文章 | 加载已有文章 |
| [share/](src/app/share/) | `/share` | 分享/链接收藏 | `src/app/share/list.json` |
| [projects/](src/app/projects/) | `/projects` | 项目展示 | `src/app/projects/list.json` |
| [pictures/](src/app/pictures/) | `/pictures` | 图床/相册 | `src/app/pictures/list.json` |
| [snippets/](src/app/snippets/) | `/snippets` | 代码片段 | `src/app/snippets/list.json` |
| [bloggers/](src/app/bloggers/) | `/bloggers` | 博主关注 | `src/app/bloggers/list.json` |
| [about/](src/app/about/) | `/about` | 关于页 | `src/app/about/list.json` |
| [music/](src/app/music/) | `/music` | 音乐播放器（播放列表、进度、音量） | `src/config/music.ts` |
| [live2d/](src/app/live2d/) | `/live2d` | Live2D 看板娘 | 静态展示 |
| [clock/](src/app/clock/) | `/clock` | 秒表/计时器 | 纯前端工具 |
| [image-toolbox/](src/app/image-toolbox/) | `/image-toolbox` | 图片处理工具 | 纯前端工具 |
| [wuthering-waves/](src/app/wuthering-waves/) | `/wuthering-waves` | 鸣潮抽卡记录 | 纯前端工具 |
| [rss.xml/](src/app/rss.xml/) | `/rss.xml` | RSS 订阅源 | 服务端生成 |
| [svgs/](src/app/svgs/) | `/svgs` | SVG 图标展示 | 自动扫描 `src/svgs/` |
| [layout.tsx](src/app/layout.tsx) | — | 全局布局组件 | — |
| [sitemap.ts](src/app/sitemap.ts) | `/sitemap.xml` | 站点地图 | 服务端生成 |

---

### 编辑器三件套

#### blog/ — 博客

- 列表页按日/周/月/年/分类分组，支持编辑模式（批量删除、管理分类）
- 列表页搜索：时间维度胶囊右侧的搜索图标，**同页切换**为搜索态（标题关键词 + 标签多选 AND，仅普通文章，零额外请求；与专栏搜索各自独立）
- 详情页加载 `config.json` + `index.md`，Markdown 渲染 + 目录导航 + 封面上传
- 数据源：`public/blogs/` + `useBlogIndex()` SWR hook
- 详见 [docs/blog-article.md](blog-article.md)

#### write/ — 编辑器

- 新建模式（`/write`）和编辑模式（`/write/{slug}`）
- 左侧 Markdown 编辑器 + 右侧侧边栏（封面、元数据、图片管理）
- 状态管理：Zustand（`write-store.ts`）
- 发布/更新/删除通过 GitHub API 写入仓库

#### (home)/ — 首页

- 多个可拖拽的 Card 组件（HiCard、ArtCard、HatCard、ShareCard、ArticleCard 等）
- 配置对话框（站点设置：元数据、图标、插画、帽子、背景、社交按钮）
- 状态管理：`config-store.ts`（卡片位置、样式、站点内容）
- 配置保存通过 `push-site-content.ts` 写入 GitHub
- 详见 [docs/app/home-page.md](home-page.md)

---

### 专栏（collections/）

用于**长期维护、持续追加、非时间线**的系列内容（论文阅读汇总、leetcode 刷题记录等），与 `/blog` 的"近期文章"时间流分开，通过首页 GENERAL 导航的「我的专栏」进入。

> 站内显示名为「我的专栏」，代码与 URL 仍沿用 `collections`（`/collections`、`collections.json`、`CollectionItem` 等），二者是同一概念。

- 注册表：`public/blogs/collections.json`（专栏元信息 + 成员文章 slug，**手工维护**；展示顺序按时间倒序，不手工排序）
- 扁平索引：`public/blogs/collection-articles.json`（**构建期自动生成**，含全部专栏文章的标题/日期/标签/摘要/封面 → 前端 **1 次请求**取全，不再逐篇请求 `config.json`）
- 生成脚本：`scripts/gen-collections-index.js`（`pnpm collections:index`；`dev`/`build`/`build:cf` 前自动执行；顺带做封面回退——专栏文章无自有封面时用专栏封面）
- 专栏正文：`public/blogs/{collection}/index.md` + `cover.*`
- 专栏文章：`public/blogs/{collection}/articles/{article}/`，每篇是一个**完整的普通文章目录**（`config.json` + `index.md`）
- 渲染：专栏文章页与 `/blog/{slug}` **共用** `@/components/blog-preview` 的 `<BlogPreview>`，表现完全一致
- 列表页布局：参照 `/projects`（双列卡片 `max-w-[1200px]`）
- 检索分两步：`/collections` 首屏**只加载注册表**（1 个请求）并显示搜索入口；进入 `/collections/search` 才加载扁平索引（1 个请求）拿到全部标签与文章（跨专栏，**标题关键词**（留空不筛）+ **标签多选 AND**，含候选数量、会归零的标签置灰，默认列出全部文章）
- 首页信息流：「最新文章」「随机推荐」通过 `src/hooks/use-article-feed.ts` 合并普通文章与专栏文章后取最新/随机
- 注意：`/collections/search` 为静态路由，会遮蔽同名专栏，勿将专栏 slug 命名为 `search`
- 旧链接 `/blog/{collection}[/{article}]` 会自动重定向到 `/collections/...`

详见 [docs/collections.md](collections.md)。

---

### 内容页面

这些页面结构相似，都通过 `list.json` 存储数据，通过专用 service 写入 GitHub：

| 页面 | 数据类型 | Service |
|------|---------|---------|
| `/share` | 分享链接（名称、URL、logo、描述、标签、星数） | `push-shares.ts` |
| `/projects` | 项目（名称、描述、链接、截图、标签） | `push-projects.ts` |
| `/pictures` | 图片（标题、文件、日期） | `push-pictures.ts` |
| `/snippets` | 代码片段 | 通过 blog 系统托管 |
| `/bloggers` | 博主信息（名称、链接、头像、描述、标签） | `push-bloggers.ts` |
| `/about` | Markdown 格式的关于内容 | `push-about.ts` |
| `/music` | 音乐播放器（曲目列表、进度、音量） | — |

各 `list.json` 文件格式如下。

#### `/share` — `src/app/share/list.json`

```json
[
  {
    "name": "iLoveIMG",
    "url": "https://www.iloveimg.com/zh-cn",
    "logo": "/images/share/7e91e93e3cdd586b.svg",
    "description": "免费图片处理网站，压缩效果比 Tinypng 更好。",
    "tags": ["图片"],
    "stars": 4
  }
]
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | string | 分享名称 |
| `url` | string | 链接地址 |
| `logo` | string | 图标路径（本地文件或外链 URL） |
| `description` | string | 简短描述 |
| `tags` | string[] | 标签数组 |
| `stars` | number | 星数（1-5） |

#### `/projects` — `src/app/projects/list.json`

```json
[
  {
    "name": "Pixel Motion",
    "year": 2025,
    "description": "网页端像素绘画工具，支持组件化画布。",
    "image": "https://pixel-motion.yysuni.com/favicon.svg",
    "url": "https://pixel-motion.yysuni.com/",
    "tags": ["像素画", "React", "Figma"]
  }
]
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | string | 项目名称 |
| `year` | number | 年份 |
| `description` | string | 项目描述 |
| `image` | string | 截图/图标路径 |
| `url` | string | 项目链接（可为空） |
| `tags` | string[] | 标签数组 |

#### `/pictures` — `src/app/pictures/list.json`

```json
[
  {
    "id": "1764336067650-188e7e4bf33f88",
    "uploadedAt": "2025-11-28T13:21:07.650Z",
    "description": "我的头像",
    "images": ["/images/pictures/b346636da687740b.webp"]
  }
]
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 唯一标识（时间戳 + 随机串） |
| `uploadedAt` | string | 上传时间（ISO 8601） |
| `description` | string | 图片描述 |
| `images` | string[] | 图片路径数组（可多张） |

#### `/snippets` — `src/app/snippets/list.json`

```json
[
  "记录，是对某项技术，重新、独立思考"
]
```

snippets 用更简单的方式存储，部分内容通过 blog 系统（`public/blogs/snippets/`）补充。

#### `/bloggers` — `src/app/bloggers/list.json`

```json
[
  {
    "name": "阮一峰的网络日志",
    "avatar": "/images/blogger/fe25259da8e3609b.png",
    "url": "https://www.ruanyifeng.com/blog/archives.html",
    "description": "经典必看，每周更新。",
    "stars": 5
  }
]
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | string | 博主名称 |
| `avatar` | string | 头像路径 |
| `url` | string | 博客链接 |
| `description` | string | 简介 |
| `stars` | number | 星数（1-5） |
| `status` | string | 可选，`"disconnected"` 表示已断连 |

#### `/about` — `src/app/about/list.json`

```json
{
  "title": "关于本站",
  "description": "一个基于 Github 的现代化博客系统",
  "content": "📦网站基于 Github 仓库...\n\n## 技术栈\n\n- Next.js\n- React"
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `title` | string | 页面标题 |
| `description` | string | 简短描述（SEO） |
| `content` | string | 正文（Markdown 格式，`\n` 换行） |

#### `/music` — `src/config/music.ts`

音乐数据集中在 `src/config/music.ts`：

```ts
export type MusicTrack = {
  id: string
  title: string
  artist?: string
  src: string
  cover?: string
}

export const MUSIC_TRACKS: MusicTrack[] = [
  { id: 'close-to-you', title: 'Close To You', artist: 'Carpenters', src: '/music/close-to-you.mp3' }
]
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 唯一标识 |
| `title` | string | 歌曲名（界面显示；音频文件本身没有 ID3 title 标签） |
| `artist` | string? | 歌手 |
| `src` | string | 音频路径，文件放在 `public/music/` 下 |
| `cover` | string? | 封面图（可选） |

播放器由 `src/hooks/use-music.ts` 统一管理（全局唯一 `HTMLAudioElement`），首页悬浮卡 `src/components/music-card.tsx` 与 `/music` 页面 `src/app/music/page.tsx` 共用同一份播放状态。

播放状态（当前曲目、播放进度、音量、静音、循环模式）会写入 `localStorage`（`pease-hub:music-state`）。下次打开时优先恢复上次状态并保持暂停，只有没有有效存档或曲目已被删除时才随机选择初始曲目。

`/music` 页面支持快捷键：`Space` 播放/暂停、`← / →` 快退/快进 5 秒、`Shift + ← / →` 上一首/下一首、`↑ / ↓` 音量 ±5%。首页悬浮卡在用户操作过音乐后会常驻，并支持切换循环模式。

---

### 纯前端工具页面

这些页面不需要后端，不涉及 GitHub API：

| 页面 | 功能 |
|------|------|
| `/clock` | 秒表和倒计时器，支持计圈/暂停/重置 |
| `/image-toolbox` | 图片批量处理（格式转换、尺寸调整、压缩） |
| `/wuthering-waves` | 鸣潮游戏抽卡记录导入与展示 |
| `/live2d` | Live2D 看板娘 3D 模型展示 |
| `/svgs` | SVG 图标画廊，自动扫描 `src/svgs/` 下所有 SVG 组件 |

### 服务端路由

| 文件 | URL | 说明 |
|------|-----|------|
| `rss.xml/route.ts` | `/rss.xml` | 动态生成 RSS 订阅源（读取 `blog/index.json`） |
| `sitemap.ts` | `/sitemap.xml` | 自动生成站点地图 |

### 全局文件

| 文件 | 作用 |
|------|------|
| `layout.tsx` | 根布局组件，所有页面共享（导航栏、背景、全局样式） |

---

## `src/` 其他目录

| 目录/文件 | 作用 |
|-----------|------|
| [components/](src/components/) | 跨页面复用的 UI 组件（Card、BlogPreview、BlogToc、MusicCard、NavCard、LiquidGrass 等） |
| [config/](src/config/) | 站点配置文件（`site-content.json`、`card-styles.json`） |
| [consts.ts](src/consts.ts) | 全局常量（GitHub 配置、动画延迟、卡片间距等） |
| [hooks/](src/hooks/) | 自定义 Hooks（`use-blog-index`、`use-auth`、`use-markdown-render`、`use-read-articles` 等） |
| [layout/](src/layout/) | 布局相关组件（雪花背景、导航栏等） |
| [lib/](src/lib/) | 核心工具库（GitHub API 客户端、Markdown 渲染器、认证、加密、文件工具、专栏注册表 `collections.ts`） |
| [styles/](src/styles/) | 全局样式（CSS 文件） |
| [svgs/](src/svgs/) | SVG React 组件（通过 `@svgr/webpack` 导入 `.svg` 文件自动转换为组件） |
