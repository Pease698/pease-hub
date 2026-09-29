'use client'

import Link from 'next/link'
import dayjs from 'dayjs'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { INIT_DELAY } from '@/consts'
import { BlogPreview } from '@/components/blog-preview'
import { ScrollBar } from '@/components/scroll-bar'
import { loadCollectionArticle, type LoadedBlog } from '@/lib/load-blog'
import { collectionArticleKey } from '@/lib/collections'
import { useReadArticles } from '@/hooks/use-read-articles'

export default function CollectionArticlePage() {
	const params = useParams() as { collection?: string | string[]; article?: string | string[] }
	const collection = Array.isArray(params?.collection) ? params.collection[0] : params?.collection || ''
	const article = Array.isArray(params?.article) ? params.article[0] : params?.article || ''
	const { markAsRead } = useReadArticles()

	const [blog, setBlog] = useState<LoadedBlog | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		let cancelled = false

		async function run() {
			if (!collection || !article) return
			try {
				setLoading(true)
				const blogData = await loadCollectionArticle(collection, article)

				if (!cancelled) {
					setBlog(blogData)
					setError(null)
					markAsRead(collectionArticleKey(collection, article))
				}
			} catch (e: any) {
				if (!cancelled) setError(e?.message || '加载失败')
			} finally {
				if (!cancelled) setLoading(false)
			}
		}

		run()
		return () => {
			cancelled = true
		}
	}, [collection, article, markAsRead])

	const title = useMemo(() => (blog?.config.title ? blog.config.title : article), [blog?.config.title, article])
	const date = useMemo(() => dayjs(blog?.config.date).format('YYYY年 M月 D日'), [blog?.config.date])
	const tags = blog?.config.tags || []

	if (!collection || !article) {
		return <div className='text-secondary flex h-full items-center justify-center text-sm'>无效的链接</div>
	}

	if (loading) {
		return <div className='text-secondary flex h-full items-center justify-center text-sm'>加载中...</div>
	}

	if (error) {
		return <div className='flex h-full items-center justify-center text-sm text-red-500'>{error}</div>
	}

	if (!blog) {
		return <div className='text-secondary flex h-full items-center justify-center text-sm'>文章不存在</div>
	}

	return (
		<>
			<ScrollBar />

			{/* 与 /blog/[id] 的“编辑”按钮同款定位，避免与左侧导航卡片重叠 */}
			<motion.div
				initial={{ opacity: 0, scale: 0.6 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ delay: INIT_DELAY }}
				className='absolute top-4 right-6 max-sm:hidden'>
				<Link
					href={`/collections/${collection}`}
					className='text-secondary hover:text-brand inline-flex items-center gap-2 rounded-xl border bg-white/60 px-6 py-2 text-sm backdrop-blur-sm transition-colors hover:bg-white/80'>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						width='16'
						height='16'
						viewBox='0 0 24 24'
						fill='none'
						stroke='currentColor'
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'>
						<path d='m15 18-6-6 6-6' />
					</svg>
					返回专栏
				</Link>
			</motion.div>

			{/* 专栏子文章不渲染封面 */}
			<BlogPreview
				markdown={blog.markdown}
				title={title}
				tags={tags}
				date={date}
				summary={blog.config.summary}
				slug={collectionArticleKey(collection, article)}
			/>
		</>
	)
}
