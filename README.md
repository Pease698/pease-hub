# pease-hub

基于 [2025-blog-public](https://github.com/YYsuni/2025-blog-public) 的个人博客。

## 技术栈

Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 + Cloudflare Workers

## 本地开发

```bash
pnpm install
pnpm dev        # http://localhost:2025
```

## 部署

部署于 Cloudflare Workers：

```bash
pnpm run build:cf && pnpm run deploy
```

## 文档

- [源码结构](docs/app-structure.md)
- [博客文章系统](docs/blog-article.md)
- [首页详解](docs/home-page.md)
- [图片资源](docs/images.md)

## 许可

MIT License — 详见 [LICENSE](LICENSE)

