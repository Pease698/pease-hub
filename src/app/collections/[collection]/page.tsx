'use client'

import Link from 'next/link'
import dayjs from 'dayjs'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { INIT_DELAY } from '@/consts'
import { collectionArticleKey, findCollection, loadCollectionArticles, type CollectionArticle, type CollectionItem } from '@/lib/collections'
import { useMarkdownRender } from '@/hooks/use-markdown-render'
import { useReadArticles } from '@/hooks/use-read-articles'
import { ScrollBar } from '@/components/scroll-bar'
import ShortLineSVG from '@/svgs/short-line.svg'

export default function CollectionPage() {
	const params = useParams() as { collection?: string | string[] }
	const slug = Array.isArray(params?.collection) ? params.collection[0] : params?.collection || ''
	const { isRead } = useReadArticles()

	const [collection, setCollection] = useState<CollectionItem | null>(null)
	const [articles, setArticles] = useState<CollectionArticle[]>([])
	const [intro, setIntro] = useState('')
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		let cancelled = false

		async function run() {
			if (!slug) return
			setLoading(true)
			try {
				const item = await findCollection(slug)
				if (cancelled) return
				setCollection(item)
				if (!item) return

				// 成员文章的标题/标签/时间取自各文章 config.json，顺序由时间决定
				const [list, introRes] = await Promise.all([loadCollectionArticles(item), fetch(`/blogs/${encodeURIComponent(slug)}/index.md`)])
				if (cancelled) return
				setArticles(list)
				setIntro(introRes.ok ? await introRes.text() : '')
			} finally {
				if (!cancelled) setLoading(false)
			}
		}

		run()
		return () => {
			cancelled = true
		}
	}, [slug])

	const { content: introContent } = useMarkdownRender(collection ? intro : '')

	if (loading) {
		return <div className='text-secondary flex h-full items-center justify-center text-sm'>加载中...</div>
	}

	if (!collection) {
		return <div className='text-secondary flex h-full items-center justify-center text-sm'>专栏不存在</div>
	}

	return (
		<>
			<ScrollBar />
			<div className='mx-auto max-w-[900px] px-6 pt-24 pb-12'>
				<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: INIT_DELAY }} className='mb-6'>
					<Link href='/collections' className='text-secondary hover:text-brand group mb-6 inline-flex items-center gap-2 text-sm transition-colors'>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							width='16'
							height='16'
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'
							className='transition-transform group-hover:-translate-x-0.5'>
							<path d='m15 18-6-6 6-6' />
						</svg>
						返回专栏列表
					</Link>

					{/* 顶栏：高度由封面原始比例与右侧文字共同撑开，两者都完整显示 */}
					<div className='card relative flex flex-col gap-5 !rounded-[32px] sm:flex-row sm:items-start'>
						{collection.cover && (
							<img
								src={collection.cover}
								alt={collection.title}
								className='h-auto w-full rounded-xl border object-contain sm:w-56 sm:shrink-0'
							/>
						)}
						<div className='min-w-0 flex-1'>
							<h1 className='text-xl font-semibold'>{collection.title}</h1>
							{collection.summary && <p className='text-secondary mt-2 text-sm leading-relaxed'>{collection.summary}</p>}
							<p className='text-secondary mt-3 text-xs'>共 {articles.length} 篇</p>
						</div>
					</div>

					{introContent && <div className='prose mt-6 max-w-none cursor-text'>{introContent}</div>}
				</motion.div>

				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					whileInView={{ opacity: 1, scale: 1 }}
					transition={{ delay: INIT_DELAY / 2 }}
					className='card relative w-full max-w-[840px]'>
					{articles.map(article => {
						const read = isRead(collectionArticleKey(collection.slug, article.slug))
						return (
							<Link
								key={article.slug}
								href={`/collections/${collection.slug}/${article.slug}`}
								className='group flex min-h-10 items-center gap-3 py-3 transition-all'>
								<span className='text-secondary w-[44px] shrink-0 text-sm font-medium'>
									{article.date ? dayjs(article.date).format('MM-DD') : '--'}
								</span>

								<div className='relative flex h-2 w-2 items-center justify-center'>
									<div className='bg-secondary group-hover:bg-brand h-[5px] w-[5px] rounded-full transition-all group-hover:h-4'></div>
									<ShortLineSVG className='absolute bottom-4' />
								</div>

								<div className='flex-1 truncate text-sm font-medium transition-all group-hover:text-brand group-hover:translate-x-2'>
									{article.title}
									{read && <span className='text-secondary ml-2 text-xs'>[已阅读]</span>}
								</div>

								<div className='flex flex-wrap items-center gap-2 max-sm:hidden'>
									{article.tags.map(tag => (
										<span key={tag} className='text-secondary text-sm'>
											#{tag}
										</span>
									))}
								</div>
							</Link>
						)
					})}

					{articles.length === 0 && <div className='text-secondary py-6 text-center text-sm'>暂无文章</div>}
				</motion.div>
			</div>
		</>
	)
}
