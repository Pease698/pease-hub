# 首页 `(home)` 目录详解

`src/app/(home)/` 是整个网站的首页（路由路径 `/`）。括号表示 Next.js Route Group，括号内名称不出现在 URL 中。

## 目录结构

```
src/app/(home)/
├── page.tsx                         ← 首页入口，组合所有卡片
│
├── hi-card.tsx                      ← 问候卡片
├── art-card.tsx                     ← 插画卡片
├── clock-card.tsx                   ← 数字时钟卡片（七段数码管）
├── calendar-card.tsx                ← 月历卡片
├── social-buttons.tsx               ← 社交按钮组
├── share-card.tsx                   ← 随机推荐卡片
├── aritcle-card.tsx                 ← 最新文章卡片
├── write-buttons.tsx                ← 写文章/配置按钮
├── like-position.tsx                ← 点赞按钮
├── hat-card.tsx                     ← 帽子装饰卡片
├── beian-card.tsx                   ← ICP 备案号卡片
├── home-draggable-layer.tsx         ← 拖拽/缩放容器（编辑模式）
│
├── stores/
│   ├── config-store.ts              ← 站点配置 + 卡片样式的 Zustand store
│   └── layout-edit-store.ts         ← 首页布局编辑状态（拖拽偏移量）
│
├── config-dialog/
│   ├── index.tsx                    ← 配置对话框入口（Tab 切换）
│   ├── color-config.tsx             ← 颜色主题配置 Tab
│   ├── home-layout.tsx              ← 首页布局管理 Tab
│   └── site-settings/
│       ├── index.tsx                ← 站点设置 Tab
│       ├── site-meta-form.tsx       ← 站点元数据表单
│       ├── favicon-avatar-upload.tsx ← Favicon/头像上传
│       ├── art-images-section.tsx   ← 插画管理
│       ├── hat-section.tsx          ← 帽子管理
│       ├── background-images-section.tsx ← 背景图片管理
│       ├── social-buttons-section.tsx    ← 社交按钮配置
│       ├── beian-form.tsx           ← 备案号表单
│       └── types.ts                 ← 类型定义
│
└── services/
    └── push-site-content.ts         ← 站点配置持久化到 GitHub
```

---

## 入口文件

### page.tsx

首页根组件。职责：

1. 按配置条件渲染各个卡片组件（通过 `cardStyles.xxx.enabled` 控制显隐）
2. 支持圣诞雪花背景（`SnowfallBackground`，在内容层前后各渲染一层实现前后景效果）
3. 编辑模式下显示顶部操作栏（"取消/保存偏移"）
4. `Ctrl/Cmd+L` 或 `Ctrl/Cmd+,` 快捷键打开配置对话框
5. 移动端（`maxSM`）隐藏部分卡片

---

## 卡片组件（10 个）

所有卡片通过 `HomeDraggableLayer` 包裹，支持编辑模式下拖拽调整位置。每个卡片的位置由 `cardStyles` 中的 offset/width/height 决定，并在多个卡片之间通过 `CARD_SPACING` 常量计算相对偏移。

### hi-card.tsx — 问候卡片

- **位置**：屏幕中央偏上
- **内容**：展示头像（点击跳转到 `/live2d`）、根据时间段动态显示英文问候语（Good Morning/Afternoon/Evening/Night）、用户名（来自 `siteContent.meta.username`）
- **特殊效果**：圣诞模式下头像上方和下方叠加雪花装饰

### art-card.tsx — 插画卡片

- **位置**：hi-card 正上方
- **内容**：展示一张插画，点击跳转到 `/pictures`
- **数据源**：`siteContent.artImages`（图片数组）+ `siteContent.currentArtImageId`（当前选中），无配置时 fallback 到 `/images/art/cat.png`

### clock-card.tsx — 数字时钟

- **位置**：hi-card 右侧
- **内容**：七段数码管实时时钟，点击跳转到 `/clock`
- **配置**：`siteContent.clockShowSeconds` 控制是否显示秒
- **移动端**：隐藏

### calendar-card.tsx — 月历卡片

- **位置**：clock-card 下方
- **内容**：当月日历，星期一行首，今天高亮，中文星期标题
- **移动端**：隐藏

### social-buttons.tsx — 社交按钮组

- **位置**：hi-card 右下方
- **内容**：一组社交/联系按钮，支持 15 种平台类型
- **支持的平台**：GitHub、掘金、Email、X(Twitter)、Telegram、微信、Facebook、TikTok、Instagram、微博、小红书、知乎、B站、QQ、自定义链接
- **交互逻辑**：
  - GitHub：特殊黑色样式按钮
  - Email/微信/QQ：点击复制到剪贴板（Email/微信/QQ 三类分别提示不同文案）
  - 微信/QQ 配置了图片路径时：点击弹出二维码（Portal 渲染，AnimatePresence 动画）
  - 其余平台：点击跳转外链
- **动画**：按钮逐个延迟出现

### share-card.tsx — 随机推荐

- **位置**：社交按钮下方
- **内容**：从 `share/list.json` 中随机选取一条分享展示（logo + 名称 + 描述），点击跳转 `/share`
- **移动端**：隐藏

### aritcle-card.tsx — 最新文章

- **位置**：hi-card 左下方
- **内容**：展示最新一篇博客的封面、标题、摘要、日期
- **数据源**：`useLatestBlog()` hook（读取 `blogs/index.json` 第一条）
- **文件名说明**：文件拼写为 `aritcle-card.tsx`（原项目拼写如此，不影响功能）

### write-buttons.tsx — 操作按钮

- **位置**：clock-card 上方
- **内容**：两个按钮 — "写文章"（跳转 `/write`）和 "..."（打开配置对话框）
- **移动端**：隐藏

### like-position.tsx — 点赞按钮

- **位置**：首页左下区域
- **内容**：`LikeButton` 组件（点赞计数 + 动画效果）

### hat-card.tsx — 帽子装饰

- **位置**：hi-card 上方居中
- **内容**：从 `/images/hats/` 中选取一个帽子图片，点击可叠加多个帽子
- **配置**：`siteContent.currentHatIndex`（帽子编号）、`siteContent.hatFlipped`（水平翻转）
- **移动端**：隐藏

### beian-card.tsx — ICP 备案号

- **位置**：hi-card 右下
- **内容**：显示 ICP 备案号，支持可点击链接
- **数据源**：`siteContent.beian`（`{ text, link }`）
- **逻辑**：未配置备案号时完全不渲染

---

## 拖拽系统

### home-draggable-layer.tsx

每个卡片的拖拽容器。在**编辑模式**下提供两种操作：

1. **拖拽移动**：光标变为 `cursor-move`，`mousedown/touchstart` 开始拖拽，通过 `setOffset()` 更新卡片相对于屏幕中心的偏移量
2. **右下角缩放**：拖拽右下角的 `DraggerSVG` 图标调整卡片宽高（最小 50px）

编辑模式下会在卡片外围渲染一个虚线边框指示可编辑区域。偏移量保存在 `layout-edit-store` 中，仅为前端内存状态（不自动持久化，需手动保存到 GitHub 配置）。

---

## 状态管理

### stores/config-store.ts

Zustand store，管理：

| 字段 | 类型 | 说明 |
|------|------|------|
| `siteContent` | `SiteContent` | 站点所有内容配置（从 `src/config/site-content.json` 加载） |
| `cardStyles` | `CardStyles` | 所有卡片的样式/位置/显示配置（从 `src/config/card-styles.json` 加载） |
| `regenerateKey` | `number` | 泡沫背景重新生成触发器 |
| `configDialogOpen` | `boolean` | 配置对话框开关状态 |

提供 `setSiteContent`、`setCardStyles`、`resetSiteContent`、`resetCardStyles` 等操作方法。

### stores/layout-edit-store.ts

Zustand store，管理拖拽编辑模式：

| 字段 | 说明 |
|------|------|
| `editing` | 是否处于编辑模式 |
| `snapshot` | 进入编辑模式前的卡片样式快照（用于取消回滚） |

核心方法：
- `startEditing()` — 保存快照，开启编辑
- `cancelEditing()` — 从快照恢复，退出编辑
- `saveEditing()` — 保留修改，退出编辑（仅保存到内存）
- `setOffset(key, x, y)` — 更新某张卡片的偏移量
- `setSize(key, w, h)` — 更新某张卡片的宽高

---

## 配置对话框

### config-dialog/index.tsx

通过首页右下角 "..." 按钮或 `Ctrl/Cmd+L` 打开的模态框。

**三个 Tab**：
1. **站点** — `SiteSettings` 组件
2. **颜色** — `ColorConfig` 组件
3. **布局** — `HomeLayout` 组件

保存时需要 GitHub App 认证（导入 `.pem` 私钥），通过 `pushSiteContent()` 写入仓库。

### config-dialog/site-settings/ — 站点设置子组件

| 组件 | 功能 |
|------|------|
| `index.tsx` | 站点设置 Tab 的整体布局 |
| `site-meta-form.tsx` | 站点元数据表单（站点名、用户名、描述等） |
| `favicon-avatar-upload.tsx` | 上传 favicon 和头像（写入 `public/images/avatar.png`） |
| `art-images-section.tsx` | 插画管理（上传、删除、切换当前显示的插画） |
| `hat-section.tsx` | 帽子管理（选择帽子图片、翻转） |
| `background-images-section.tsx` | 背景图片管理 |
| `social-buttons-section.tsx` | 社交按钮配置（添加、删除、排序、设置链接/图片） |
| `beian-form.tsx` | ICP 备案号表单 |
| `types.ts` | 站点设置相关的 TypeScript 类型 |

### config-dialog/color-config.tsx

颜色主题配置，修改后调用 `regenerateBubbles()` 触发背景重新渲染。

### config-dialog/home-layout.tsx

首页布局管理：
1. 进入/退出拖拽编辑模式
2. 重置所有卡片偏移（恢复默认位置）
3. 显示当前各卡片的位置和尺寸信息

---

## Services

### services/push-site-content.ts

将站点配置持久化到 GitHub 仓库。通过 Git Trees API 批量提交：

- `src/config/site-content.json`
- `src/config/card-styles.json`
- `public/favicon.png`
- `public/images/avatar.png`
- `public/images/art/*`（插画图片）
- `public/images/backgrounds/*`（背景图片）
- `public/images/social-buttons/*`（社交按钮图片，微信/QQ 二维码等）

支持增量更新（只修改变更的部分），自动处理图片上传的 SHA-256 去重。
