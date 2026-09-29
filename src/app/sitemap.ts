import fs from 'node:fs'
import path from 'node:path'

import { MetadataRoute } from 'next'
import blogIndex from '@/../public/blogs/index.json'
import collections from '@/../public/blogs/collections.json'
import type { BlogIndexItem } from '@/app/blog/types'

export const dynamic = 'force-static'

const PUBLIC_DIR = path.join(process.cwd(), 'public')

type CollectionRegistryItem = {
	slug: string
	date?: string
	articles?: string[]
}

/** 专栏文章的更新时间取自各自的 config.json（构建期读取） */
function readArticleDate(collectionSlug: string, articleSlug: string, fallback?: string): Date {
	try {
		const file = path.join(PUBLIC_DIR, 'blogs', collectionSlug, 'articles', articleSlug, 'config.json')
		const config = JSON.parse(fs.readFileSync(file, 'utf8')) as { date?: string }
		if (config?.date) return new Date(config.date)
	} catch {
		// 忽略，回退到专栏日期
	}
	return fallback ? new Date(fallback) : new Date()
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	// 域名配置：
	// 1. 优先使用 SITE_URL (你在 Vercel 手动设置的正式域名)
	// 2. 其次尝试 VERCEL_URL (Vercel 自动生成的预览域名，通常不带 https://)
	// 3. 最后回退到本地开发地址
	const baseUrl = process.env.SITE_URL ? process.env.SITE_URL : process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'

	console.log(`[Sitemap] Generating for: ${baseUrl}`)

	let posts: BlogIndexItem[] = blogIndex
	const collectionList = collections as CollectionRegistryItem[]

	const postEntries: MetadataRoute.Sitemap = posts.map(post => ({
		url: `${baseUrl}/blog/${post.slug}`,
		lastModified: post.date ? new Date(post.date) : new Date(),
		changeFrequency: 'weekly',
		priority: 0.8
	}))

	// 专栏页与专栏文章
	const collectionEntries: MetadataRoute.Sitemap = collectionList
		.filter(collection => Boolean(collection?.slug))
		.flatMap(collection => {
			const detail: MetadataRoute.Sitemap[number] = {
				url: `${baseUrl}/collections/${collection.slug}`,
				lastModified: collection.date ? new Date(collection.date) : new Date(),
				changeFrequency: 'weekly',
				priority: 0.7
			}

			const articles: MetadataRoute.Sitemap = (collection.articles ?? [])
				.filter((articleSlug): articleSlug is string => typeof articleSlug === 'string' && Boolean(articleSlug))
				.map(articleSlug => ({
					url: `${baseUrl}/collections/${collection.slug}/${articleSlug}`,
					lastModified: readArticleDate(collection.slug, articleSlug, collection.date),
					changeFrequency: 'weekly',
					priority: 0.6
				}))

			return [detail, ...articles]
		})

	const staticEntries: MetadataRoute.Sitemap = [
		{
			url: baseUrl,
			lastModified: new Date(),
			changeFrequency: 'daily',
			priority: 1
		},
		{
			url: `${baseUrl}/collections`,
			lastModified: new Date(),
			changeFrequency: 'weekly',
			priority: 0.7
		}
	]

	return [...staticEntries, ...postEntries, ...collectionEntries]
}
