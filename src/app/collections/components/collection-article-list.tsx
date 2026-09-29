'use client'

import Link from 'next/link'
import dayjs from 'dayjs'
import { collectionArticleKey, type CollectionArticle } from '@/lib/collections'
import { useReadArticles } from '@/hooks/use-read-articles'
import ShortLineSVG from '@/svgs/short-line.svg'

type CollectionArticleListProps = {
	articles: CollectionArticle[]
	/** 无结果时的提示文案 */
	emptyText?: string
}

/**
 * 跨专栏的文章结果行：日期 · 时间线圆点 · 标题 · 所属专栏徽标 · tags
 * 只渲染行本身与空状态，外层卡片容器由调用方提供。
 */
export function CollectionArticleList({ articles, emptyText = '没有找到相关文章' }: CollectionArticleListProps) {
	const { isRead } = useReadArticles()

	if (articles.length === 0) {
		return <div className='text-secondary py-6 text-center text-sm'>{emptyText}</div>
	}

	return (
		<>
			{articles.map(article => {
				const key = collectionArticleKey(article.collection, article.slug)
				const read = isRead(key)

				return (
					<Link key={key} href={`/collections/${article.collection}/${article.slug}`} className='group flex min-h-10 items-center gap-3 py-3 transition-all'>
						<span className='text-secondary w-[44px] shrink-0 text-sm font-medium'>{article.date ? dayjs(article.date).format('MM-DD') : '--'}</span>

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
		</>
	)
}
