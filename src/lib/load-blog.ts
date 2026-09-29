import type { BlogConfig } from '@/app/blog/types'

export type { BlogConfig } from '@/app/blog/types'

export type LoadedBlog = {
	slug: string
	config: BlogConfig
	markdown: string
	cover?: string
}

/**
 * Load blog data from a public directory that contains config.json + index.md
 */
async function loadFromDir(dir: string, slug: string): Promise<LoadedBlog> {
	if (!slug) {
		throw new Error('Slug is required')
	}

	// Load config.json
	let config: BlogConfig = {}
	const configRes = await fetch(`${dir}/config.json`)
	if (configRes.ok) {
		try {
			config = await configRes.json()
		} catch {
			config = {}
		}
	}

	// Load index.md
	const mdRes = await fetch(`${dir}/index.md`)
	if (!mdRes.ok) {
		throw new Error('Blog not found')
	}
	const markdown = await mdRes.text()

	return {
		slug,
		config,
		markdown,
		cover: config.cover
	}
}

/**
 * Load a normal blog from public/blogs/{slug}
 * Used by both view page and edit page
 */
export async function loadBlog(slug: string): Promise<LoadedBlog> {
	if (!slug) {
		throw new Error('Slug is required')
	}

	return loadFromDir(`/blogs/${encodeURIComponent(slug)}`, slug)
}

/**
 * Load an article that belongs to a collection:
 * public/blogs/{collection}/articles/{article}
 *
 * 只读取正文与自己的 config.json；专栏文章的**元信息集合**请走
 * `@/lib/collections` 的 `loadAllCollectionArticles()`（构建期生成的扁平索引，一次请求）。
 *
 * 注意：collection 与 article 必须分别编码，不能拼成一个带 `/` 的 slug 再编码。
 */
export async function loadCollectionArticle(collection: string, article: string): Promise<LoadedBlog> {
	if (!collection || !article) {
		throw new Error('Collection and article are required')
	}

	return loadFromDir(`/blogs/${encodeURIComponent(collection)}/articles/${encodeURIComponent(article)}`, `${collection}/${article}`)
}
