'use client'

/**
 * 专栏（Collection）注册表读取。
 *
 * 数据来源：public/blogs/collections.json
 *   - 只登记"专栏元信息 + 成员文章 slug"，成员文章的标题/日期/标签一律取自
 *     各自的 config.json，避免手工维护两份。
 * 专栏正文：public/blogs/{collection}/index.md
 * 专栏文章：public/blogs/{collection}/articles/{article}/(config.json + index.md)
 *
 * 注册表在模块级缓存，整个会话只请求一次。
 * 检索相关函数复用 @/lib/tag-filter，与普通文章搜索共用同一套算法（数据源各自独立）。
 */

import { loadCollectionArticleConfig } from '@/lib/load-blog'

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
}

export const COLLECTIONS_PATH = '/blogs/collections.json'

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

function parseTime(value?: string): number {
	if (!value) return 0
	const time = new Date(value).getTime()
	return Number.isNaN(time) ? 0 : time
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
 * 读取某个专栏成员文章的元信息（标题/日期/标签），数据来自各文章自己的 config.json，
 * 并按时间倒序排列——顺序完全由时间决定，不需要在 collections.json 里手工排序。
 */
export async function loadCollectionArticles(collection: CollectionItem): Promise<CollectionArticle[]> {
	const list = await Promise.all(
		collection.articles.map(async slug => {
			const config = await loadCollectionArticleConfig(collection.slug, slug)
			return {
				slug,
				title: config.title || slug,
				date: config.date,
				tags: Array.isArray(config.tags) ? config.tags.filter((tag): tag is string => typeof tag === 'string') : [],
				collection: collection.slug,
				collectionTitle: collection.title
			}
		})
	)

	return list.sort((a, b) => parseTime(b.date) - parseTime(a.date))
}

/**
 * 读取**全部专栏**的成员文章并打平成一张表，供跨专栏检索使用。
 * 按时间倒序；模块级缓存，整个会话只加载一轮。
 */
export function loadAllCollectionArticles(): Promise<CollectionArticle[]> {
	if (!allArticlesPromise) {
		allArticlesPromise = loadCollections()
			.then(list => Promise.all(list.map(collection => loadCollectionArticles(collection))))
			.then(groups => groups.flat().sort((a, b) => parseTime(b.date) - parseTime(a.date)))
			.catch(() => [])
	}
	return allArticlesPromise
}

/** 专栏文章的稳定标识，用于点赞、已读等以字符串为 key 的场景 */
export function collectionArticleKey(collection: string, article: string): string {
	return `${collection}/${article}`
}
