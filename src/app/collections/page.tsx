'use client'

import Link from 'next/link'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { INIT_DELAY } from '@/consts'
import { useSize } from '@/hooks/use-size'
import { useReadArticles } from '@/hooks/use-read-articles'
import {
	collectionArticleKey,
	filterArticles,
	loadAllCollectionArticles,
	loadCollections,
	type CollectionArticle,
	type CollectionItem
} from '@/lib/collections'
import ShortLineSVG from '@/svgs/short-line.svg'
import { CollectionSearch } from './components/collection-search'

export default function CollectionsPage() {
	const [collections, setCollections] = useState<CollectionItem[]>([])
	const [articles, setArticles] = useState<CollectionArticle[]>([])
	const [loading, setLoading] = useState(true)
	const [keyword, setKeyword] = useState('')
	const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())

	const { maxSM } = useSize()
	const { isRead } = useReadArticles()

	useEffect(() => {
		let cancelled = false

		Promise.all([loadCollections(), loadAllCollectionArticles()])
			.then(([list, allArticles]) => {
				if (cancelled) return
				setCollections(list)
				setArticles(allArticles)
			})
			.finally(() => {
				if (!cancelled) setLoading(false)
			})

		return () => {
			cancelled = true
		}
	}, [])

	const filtering = keyword.trim() !== '' || selectedTags.size > 0
	const filtered = useMemo(() => filterArticles(articles, keyword, selectedTags), [articles, keyword, selectedTags])

	return (
		<div className='flex flex-col items-center justify-center px-6 pt-32 pb-12'>
			{loading && <div className='text-secondary py-10 text-center text-sm'>加载中...</div>}

			{!loading && articles.length > 0 && (
				<CollectionSearch
					articles={articles}
					keyword={keyword}
					onKeywordChange={setKeyword}
					selectedTags={selectedTags}
					onSelectedTagsChange={setSelectedTags}
					resultCount={filtered.length}
				/>
			)}

			{/* 未筛选：专栏卡片网格 */}
			{!loading && !filtering && (
				<>
					{collections.length > 0 ? (
						<div className='grid w-full max-w-[1200px] grid-cols-2 gap-6 max-md:grid-cols-1'>
							{collections.map((collection, index) => (
								<motion.div
									key={collection.slug}
									initial={{ opacity: 0, scale: 0.9 }}
									{...(maxSM ? { animate: { opacity: 1, scale: 1 } } : { whileInView: { opacity: 1, scale: 1 } })}
									transition={{ delay: INIT_DELAY + index * 0.08 }}
									className='h-full'>
									<Link
										href={`/collections/${collection.slug}`}
										className='card relative flex h-full flex-col gap-4 transition-opacity hover:opacity-90'>
										<div className='flex items-start gap-4'>
											{collection.cover ? (
												<img src={collection.cover} alt={collection.title} className='h-16 w-16 shrink-0 rounded-xl border object-cover' />
											) : (
												<div className='text-secondary grid h-16 w-16 shrink-0 place-items-center rounded-xl border bg-white/60 text-2xl'>+</div>
											)}

											<div className='flex-1'>
												<div className='flex items-center gap-2'>
													<h3 className='text-lg font-semibold'>{collection.title}</h3>
													<span className='text-secondary text-sm'>{collection.articles.length} 篇</span>
												</div>
											</div>
										</div>

										{collection.summary && <p className='text-secondary text-sm leading-relaxed'>{collection.summary}</p>}

										<div className='mt-auto flex flex-wrap gap-2'>
											<span className='bg-card hover:bg-bg rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors'>查看专栏</span>
										</div>
									</Link>
								</motion.div>
							))}
						</div>
					) : (
						<div className='text-secondary py-10 text-center text-sm'>暂无专栏</div>
					)}
				</>
			)}

			{/* 筛选后：跨专栏的文章结果列表 */}
			{!loading && filtering && (
				<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='card relative w-full max-w-[1200px]'>
					{filtered.map(article => {
						const read = isRead(collectionArticleKey(article.collection, article.slug))

						return (
							<Link
								key={collectionArticleKey(article.collection, article.slug)}
								href={`/collections/${article.collection}/${article.slug}`}
								className='group flex min-h-10 items-center gap-3 py-3 transition-all'>
								<span className='text-secondary w-[44px] shrink-0 text-sm font-medium'>
									{article.date ? dayjs(article.date).format('MM-DD') : '--'}
								</span>

								<div className='relative flex h-2 w-2 items-center justify-center'>
									<div className='bg-secondary group-hover:bg-brand h-[5px] w-[5px] rounded-full transition-all group-hover:h-4'></div>
									<ShortLineSVG className='absolute bottom-4' />
								</div>

								<div className='group-hover:text-brand flex-1 truncate text-sm font-medium transition-all group-hover:translate-x-2'>
									{article.title}
									{read && <span className='text-secondary ml-2 text-xs'>[已阅读]</span>}
								</div>

								<span className='text-secondary bg-card shrink-0 rounded-lg border px-2 py-0.5 text-xs'>{article.collectionTitle}</span>

								<div className='flex flex-wrap items-center gap-2 max-lg:hidden'>
									{article.tags.map(tag => (
										<span key={tag} className='text-secondary text-sm'>
											#{tag}
										</span>
									))}
								</div>
							</Link>
						)
					})}

					{filtered.length === 0 && <div className='text-secondary py-6 text-center text-sm'>没有找到相关文章</div>}
				</motion.div>
			)}
		</div>
	)
}
