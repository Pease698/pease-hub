'use client'

import { useEffect, useMemo, useState } from 'react'
import { useBlogIndex } from '@/hooks/use-blog-index'
import { loadAllCollectionArticles, type CollectionArticle } from '@/lib/collections'

/**
 * 信息流条目：普通文章与专栏文章统一成同一形状，供首页卡片等场景使用。
 * href 已按来源区分（/blog/{slug} 或 /collections/{collection}/{slug}）。
 */
export type FeedArticle = {
	key: string
	href: string
	title: string
	date?: string
	summary?: string
	cover?: string
}

function parseTime(value?: string): number {
	if (!value) return 0
	const time = new Date(value).getTime()
	return Number.isNaN(time) ? 0 : time
}

/**
 * 首页等信息流使用的文章集合：**普通文章 + 专栏文章**合并。
 *
 * - 普通文章：`useBlogIndex()`（`public/blogs/index.json`，已按登录态过滤 hidden）
 * - 专栏文章：各文章自己的 `config.json`（`loadAllCollectionArticles()`，模块级缓存，整个会话只加载一轮）
 *
 * 注意：引入专栏文章意味着首页会额外发出「专栏文章数」个 config.json 请求
 * （当前 6 个）。若日后文章数增长到使请求数成为负担，可改为构建期生成扁平索引。
 */
export function useArticleFeed() {
	const { items, loading: indexLoading } = useBlogIndex()
	const [collectionArticles, setCollectionArticles] = useState<CollectionArticle[]>([])
	const [collectionLoading, setCollectionLoading] = useState(true)

	useEffect(() => {
		let cancelled = false
		loadAllCollectionArticles()
			.then(list => {
				if (!cancelled) setCollectionArticles(list)
			})
			.finally(() => {
				if (!cancelled) setCollectionLoading(false)
			})
		return () => {
			cancelled = true
		}
	}, [])

	const articles = useMemo<FeedArticle[]>(
		() => [
			...items.map(item => ({
				key: `blog/${item.slug}`,
				href: `/blog/${item.slug}`,
				title: item.title || item.slug,
				date: item.date,
				summary: item.summary,
				cover: item.cover
			})),
			...collectionArticles.map(article => ({
				key: `collection/${article.collection}/${article.slug}`,
				href: `/collections/${article.collection}/${article.slug}`,
				title: article.title,
				date: article.date,
				summary: article.summary,
				cover: article.cover
			}))
		],
		[items, collectionArticles]
	)

	return {
		articles,
		loading: indexLoading || collectionLoading
	}
}

/** 最新一篇：普通文章与专栏文章一起比时间 */
export function useLatestArticle() {
	const { articles, loading } = useArticleFeed()

	const article = useMemo(() => {
		if (articles.length === 0) return null
		// 不原地 sort，避免改动上游数据
		return [...articles].sort((a, b) => parseTime(b.date) - parseTime(a.date))[0]
	}, [articles])

	return { article, loading }
}

/**
 * 随机推荐一篇。
 * 等两个数据源都加载完再抽，避免先抽一次、专栏数据到达后又跳变。
 */
export function useRandomArticle() {
	const { articles, loading } = useArticleFeed()

	const article = useMemo(() => {
		if (loading || articles.length === 0) return null
		return articles[Math.floor(Math.random() * articles.length)]
	}, [articles, loading])

	return { article, loading }
}
