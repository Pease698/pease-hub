# 源代码目录结构

## `src/app/` — 页面路由

Next.js App Router 约定，每个子目录自动映射为一个 URL 路径。

### 概览

| 目录 | URL | 用途 | 内容驱动方式 |
|------|-----|------|-------------|
| [(home)/](src/app/(home)/) | `/` | 首页 | 配置文件 |
| [blog/](src/app/blog/) | `/blog` | 博客列表 | `public/blogs/index.json` |
| [blog/[id]/](src/app/blog/%5Bid%5D/) | `/blog/{slug}` | 博客详情 | `public/blogs/{slug}/` |
| [write/](src/app/write/) | `/write` | 文章编辑器 | — |
| [write/[slug]/](src/app/write/%5Bslug%5D/) | `/write/{slug}` | 编辑文章 | 加载已有文章 |
| [share/](src/app/share/) | `/share` | 分享/链接收藏 | `src/app/share/list.json` |
| [projects/](src/app/projects/) | `/projects` | 项目展示 | `src/app/projects/list.json` |
| [pictures/](src/app/pictures/) | `/pictures` | 图床/相册 | `src/app/pictures/list.json` |
| [snippets/](src/app/snippets/) | `/snippets` | 代码片段 | `src/app/snippets/list.json` |
| [bloggers/](src/app/bloggers/) | `/bloggers` | 博主关注 | `src/app/bloggers/list.json` |
| [about/](src/app/about/) | `/about` | 关于页 | `src/app/about/list.json` |
| [music/](src/app/music/) | `/music` | 音乐播放器 | `src/app/music/list.ts` |
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
| `/music` | 音乐播放器（名称、iframe 嵌入） | — |

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

#### `/music` — `src/app/music/list.ts`

```ts
export const list = [
  {
    name: '歌曲名称',
    iframe: '<iframe src="//player.bilibili.com/..." scrolling="no" ...></iframe>'
  }
]
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | string | 歌曲名称 |
| `iframe` | string | 嵌入播放器 HTML（支持 Bilibili、网易云等 iframe） |

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
| [lib/](src/lib/) | 核心工具库（GitHub API 客户端、Markdown 渲染器、认证、加密、文件工具） |
| [styles/](src/styles/) | 全局样式（CSS 文件） |
| [svgs/](src/svgs/) | SVG React 组件（通过 `@svgr/webpack` 导入 `.svg` 文件自动转换为组件） |
