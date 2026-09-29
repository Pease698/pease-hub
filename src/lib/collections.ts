'use client'

/**
 * 专栏（Collection）注册表读取。
 *
 * 数据来源：
 *   - public/blogs/collections.json         专栏元信息 + 成员文章 slug（手工维护）
 *   - public/blogs/collection-articles.json **构建期生成的扁平索引**，含全部专栏文章的
 *     标题/日期/标签/摘要/封面，前端一次请求即可拿到，不再逐篇请求 config.json
 *     （由 scripts/gen-collections-index.js 生成，build / build:cf / dev 前自动执行）
 * 专栏正文：public/blogs/{collection}/index.md
 * 专栏文章：public/blogs/{collection}/articles/{article}/(config.json + index.md)
 *
 * 两个索引都在模块级缓存，整个会话各只请求一次。
 * 检索相关函数复用 @/lib/tag-filter，与普通文章搜索共用同一套算法（数据源各自独立）。
 */

export type { TagOption } from '@/lib/tag-filter'

// 检索：与普通文章搜索共用实现，见 src/lib/tag-filter.ts
export { collectTags, collectTagOptions } from '@/lib/tag-filter'
export { filterByKeywordAndTags as filterArticles } from '@/lib/tag-filter'

export type CollectionItem = {
	slug: string
	title: string
	summary?: string
	cover?: string
	date?: string
	/** 成员 slug 列表，仅表示"属于该专栏"；展示顺序按各自 config.json 的时间排序 */
	articles: string[]
}

export type CollectionArticle = {
	slug: string
	title: string
	date?: string
	tags: string[]
	/** 所属专栏 slug，用于跨专栏检索结果展示归属 */
	collection: string
	/** 所属专栏标题 */
	collectionTitle: string
	/** 来自文章自己的 config.json，供首页卡片等信息流场景使用 */
	summary?: string
	cover?: string
}

export const COLLECTIONS_PATH = '/blogs/collections.json'
export const COLLECTION_ARTICLES_PATH = '/blogs/collection-articles.json'

let collectionsPromise: Promise<CollectionItem[]> | null = null
let allArticlesPromise: Promise<CollectionArticle[]> | null = null

function normalize(raw: unknown): CollectionItem[] {
	if (!Array.isArray(raw)) return []

	return raw
		.filter((item): item is CollectionItem => !!item && typeof (item as CollectionItem).slug === 'string')
		.map(item => ({
			...item,
			articles: Array.isArray(item.articles) ? item.articles.filter((slug): slug is string => typeof slug === 'string' && Boolean(slug)) : []
		}))
}

function normalizeArticles(raw: unknown): CollectionArticle[] {
	if (!Array.isArray(raw)) return []

	return raw
		.filter(
			(item): item is CollectionArticle =>
				!!item && typeof (item as CollectionArticle).slug === 'string' && typeof (item as CollectionArticle).collection === 'string'
		)
		.map(item => ({
			...item,
			tags: Array.isArray(item.tags) ? item.tags.filter((tag): tag is string => typeof tag === 'string') : []
		}))
}

export function loadCollections(): Promise<CollectionItem[]> {
	if (!collectionsPromise) {
		collectionsPromise = fetch(COLLECTIONS_PATH, { cache: 'no-store' })
			.then(res => (res.ok ? res.json() : []))
			.then(normalize)
			.catch(() => [])
	}
	return collectionsPromise
}

export async function findCollection(slug?: string): Promise<CollectionItem | null> {
	if (!slug) return null
	const list = await loadCollections()
	return list.find(item => item.slug === slug) ?? null
}

export async function isCollectionSlug(slug?: string): Promise<boolean> {
	return (await findCollection(slug)) !== null
}

/**
 * 读取**全部专栏**的成员文章（按时间倒序）。
 *
 * 数据来自构建期生成的扁平索引 `public/blogs/collection-articles.json`——**1 个请求**就能拿到
 * 所有专栏文章的标题/日期/标签/摘要/封面，替代了原先"每篇文章各请求一次 config.json"的做法。
 * 模块级缓存，整个会话只加载一轮。
 */
export function loadAllCollectionArticles(): Promise<CollectionArticle[]> {
	if (!allArticlesPromise) {
		allArticlesPromise = fetch(COLLECTION_ARTICLES_PATH, { cache: 'no-store' })
			.then(res => (res.ok ? res.json() : []))
			.then(normalizeArticles)
			.catch(() => [])
	}
	return allArticlesPromise
}

/**
 * 读取某个专栏的成员文章（按时间倒序）。
 * 同样来自上面那份扁平索引（已在构建期按时间排好序，过滤即可保持顺序）。
 */
export async function loadCollectionArticles(collection: CollectionItem): Promise<CollectionArticle[]> {
	const all = await loadAllCollectionArticles()
	return all.filter(article => article.collection === collection.slug)
}

/** 专栏文章的稳定标识，用于点赞、已读等以字符串为 key 的场景 */
export function collectionArticleKey(collection: string, article: string): string {
	return `${collection}/${article}`
}
