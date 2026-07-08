# 图片资源目录

`public/images/` 存放网站中各类图片资源，按功能划分到子目录。

## 目录一览

```
public/images/
├── art/           ← 首页插画（ArtCard）
├── blogger/       ← 推荐博主头像（/bloggers 页）
├── christmas/     ← 圣诞雪花背景素材
│   └── snowflake/ ← 雪花形状图片
├── hats/          ← 首页帽子图标（HatCard）
├── misc/          ← 杂项图片
├── pictures/      ← 图床/相册图片（/pictures 页）
├── project/       ← 项目截图（/projects 页）
└── share/         ← 分享链接网站图标（/share 页）
```

另有 `public/images/avatar.png` 为用户头像，不属于任何子目录。

---

## 各目录详细说明

### art/ — 首页插画

- **使用位置**：首页 ArtCard 组件（`src/app/(home)/art-card.tsx`）
- **管理方式**：站点配置对话框 → 网站设置 → 插画管理
- **存储字段**：`siteContent.artImages`（数组），`siteContent.currentArtImageId`（当前显示哪张）
- **数据流**：通过 `pushSiteContent()` 上传到 `public/images/art/`

首页 ArtCard 可以配置多张插画，每次显示当前选中的一张。支持通过配置切换。

### blogger/ — 博主头像

- **使用位置**：博主关注页（`/bloggers`）
- **管理方式**：在 `/bloggers` 页面操作
- **数据流**：通过 `pushBloggers()` 上传到 `public/images/blogger/{hash}.ext`
- **写入代码**：`src/app/bloggers/services/push-bloggers.ts`

每关注一个博主时可以上传其头像。使用 SHA-256 哈希去重。

### christmas/ — 圣诞雪花背景

- **使用位置**：全局背景（`src/layout/backgrounds/snowfall.tsx`）
- **内容**：
  - `snow-1.webp` ~ `snow-13.webp` — 雪花纹理素材
  - `snowflake/1.webp` ~ `snowflake/3.webp` — 雪花形状图片
- **使用方式**：前端直接引用（无需上传），代码中硬编码路径

`SnowfallBackground` 组件用 125 个雪花粒子模拟飘雪效果。80% 为圆点，20% 为图形雪花。如果不需要雪花效果，移除该组件即可。

### hats/ — 首页帽子图标

- **使用位置**：首页 HatCard 组件（`src/app/(home)/hat-card.tsx`）
- **管理方式**：站点配置对话框 → 网站设置
- **数量**：24 个帽子图片（`1.webp` ~ `24.webp`）

HatCard 从该目录中随机选择一个帽子显示。每个帽子是一个小装饰图标，可以全部替换为其他图片。

### misc/ — 杂项

目前只有一张 `approve.png`，用途不明确，可忽略或清空。

### pictures/ — 图床/相册

- **使用位置**：图床页面（`/pictures`）
- **管理方式**：在 `/pictures` 页面操作
- **索引文件**：`src/app/pictures/list.json`
- **数据流**：通过 `pushPictures()` 上传到 `public/images/pictures/`
- **写入代码**：`src/app/pictures/services/push-pictures.ts`

支持批量上传图片，SHA-256 去重。索引文件 `list.json` 记录每张图片的标题、文件名、日期等信息。

### project/ — 项目截图

- **使用位置**：项目展示页（`/projects`）
- **管理方式**：在 `/projects` 页面操作
- **索引文件**：`src/app/projects/list.json`
- **数据流**：通过 `pushProjects()` 上传到 `public/images/project/`
- **写入代码**：`src/app/projects/services/push-projects.ts`

每个项目可以有一张或多张截图。索引文件 `list.json` 记录项目名称、描述、链接、图片等信息。

### share/ — 分享链接图标

- **使用位置**：分享页（`/share`）和首页 ShareCard（`src/app/(home)/share-card.tsx`）
- **管理方式**：在 `/share` 页面操作
- **索引文件**：`src/app/share/list.json`
- **数据流**：通过 `pushShares()` 上传到 `public/images/share/`
- **写入代码**：`src/app/share/services/push-shares.ts`

存储分享链接的 favicon/logo 图片。首页 ShareCard 随机展示一条分享。
