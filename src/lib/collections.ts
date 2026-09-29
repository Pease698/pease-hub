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
 */

import { loadCollectionArticleConfig } from '@/lib/load-blog'

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

/** 标签汇总项：标签名 + 在给定条件下的命中数 */
export type TagOption = {
	tag: string
	count: number
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

/** 汇总所有文章标签（去重 + 计数），按数量倒序、同数量按字典序 */
export function collectTags(articles: CollectionArticle[]): TagOption[] {
	const counter = new Map<string, number>()
	for (const article of articles) {
		for (const tag of article.tags) {
			counter.set(tag, (counter.get(tag) ?? 0) + 1)
		}
	}

	return Array.from(counter, ([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
}

/**
 * 检索：
 *   - 关键词为空 → 不按标题筛选（仅 trim 后比较，忽略大小写）
 *   - 未选标签 → 不按标签筛选
 *   - 选了多个标签 → 需**同时包含**（AND）
 * 两个条件同时生效。
 */
export function filterArticles(articles: CollectionArticle[], keyword: string, selectedTags: Set<string>): CollectionArticle[] {
	const query = keyword.trim().toLowerCase()
	if (!query && selectedTags.size === 0) return articles

	return articles.filter(article => {
		if (query && !article.title.toLowerCase().includes(query)) return false
		for (const tag of selectedTags) {
			if (!article.tags.includes(tag)) return false
		}
		return true
	})
}

/**
 * 计算各标签在当前条件下的候选命中数（关键词 + 已选标签 + 该标签），
 * 用于在 chip 上显示数量、并把"加了就会归零"的标签置灰。
 * 顺序沿用全局热度排序，避免选择时位置跳动。
 */
export function collectTagOptions(articles: CollectionArticle[], keyword: string, selectedTags: Set<string>): TagOption[] {
	return collectTags(articles).map(({ tag }) => {
		const candidate = new Set(selectedTags)
		candidate.add(tag)
		return { tag, count: filterArticles(articles, keyword, candidate).length }
	})
}

/** 专栏文章的稳定标识，用于点赞、已读等以字符串为 key 的场景 */
export function collectionArticleKey(collection: string, article: string): string {
	return `${collection}/${article}`
}
