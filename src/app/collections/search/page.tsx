'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { filterArticles, loadAllCollectionArticles, type CollectionArticle } from '@/lib/collections'
import { CollectionSearch } from '../components/collection-search'
import { CollectionArticleList } from '../components/collection-article-list'

export default function CollectionSearchPage() {
	const router = useRouter()
	const [articles, setArticles] = useState<CollectionArticle[]>([])
	const [loading, setLoading] = useState(true)
	const [keyword, setKeyword] = useState('')
	const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())

	// 只有进入本页才加载全部专栏文章元信息（含标签）；结果被模块级缓存，二次进入瞬时
	useEffect(() => {
		let cancelled = false
		loadAllCollectionArticles()
			.then(list => {
				if (!cancelled) setArticles(list)
			})
			.finally(() => {
				if (!cancelled) setLoading(false)
			})
		return () => {
			cancelled = true
		}
	}, [])

	// Esc 返回专栏列表
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') router.push('/collections')
		}
		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [router])

	const filtered = useMemo(() => filterArticles(articles, keyword, selectedTags), [articles, keyword, selectedTags])

	return (
		<div className='flex flex-col items-center justify-center px-6 pt-32 pb-12'>
			<div className='w-full max-w-[1200px]'>
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
			</div>

			{loading ? (
				<div className='text-secondary py-10 text-center text-sm'>正在加载专栏文章...</div>
			) : (
				<>
					<CollectionSearch
						articles={articles}
						keyword={keyword}
						onKeywordChange={setKeyword}
						selectedTags={selectedTags}
						onSelectedTagsChange={setSelectedTags}
						resultCount={filtered.length}
						autoFocus
					/>

					<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='card relative w-full max-w-[1200px]'>
						<CollectionArticleList articles={filtered} emptyText={articles.length === 0 ? '暂无专栏文章' : '没有找到相关文章'} />
					</motion.div>
				</>
			)}
		</div>
	)
}
