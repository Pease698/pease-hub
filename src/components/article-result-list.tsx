'use client'

import Link from 'next/link'
import dayjs from 'dayjs'
import ShortLineSVG from '@/svgs/short-line.svg'

export type ArticleResultItem = {
	key: string
	href: string
	title: string
	date?: string
	tags: string[]
	read?: boolean
	/** 右侧徽标，例如所属专栏；普通文章搜索不传 */
	badge?: string
}

type ArticleResultListProps = {
	items: ArticleResultItem[]
	/** 无结果时的提示文案 */
	emptyText?: string
}

/**
 * 检索结果行：日期 · 时间线圆点 · 标题 · 徽标（可选）· tags
 * 只渲染行本身与空状态，外层卡片容器由调用方提供。
 * 专栏搜索传 badge（专栏名），普通文章搜索不传。
 */
export function ArticleResultList({ items, emptyText = '没有找到相关文章' }: ArticleResultListProps) {
	if (items.length === 0) {
		return <div className='text-secondary py-6 text-center text-sm'>{emptyText}</div>
	}

	return (
		<>
			{items.map(item => (
				<Link key={item.key} href={item.href} className='group flex min-h-10 items-center gap-3 py-3 transition-all'>
					<span className='text-secondary w-[44px] shrink-0 text-sm font-medium'>{item.date ? dayjs(item.date).format('MM-DD') : '--'}</span>

					<div className='relative flex h-2 w-2 items-center justify-center'>
						<div className='bg-secondary group-hover:bg-brand h-[5px] w-[5px] rounded-full transition-all group-hover:h-4'></div>
						<ShortLineSVG className='absolute bottom-4' />
					</div>

					<div className='group-hover:text-brand flex-1 truncate text-sm font-medium transition-all group-hover:translate-x-2'>
						{item.title}
						{item.read && <span className='text-secondary ml-2 text-xs'>[已阅读]</span>}
					</div>

					{item.badge && <span className='text-secondary bg-card shrink-0 rounded-lg border px-2 py-0.5 text-xs'>{item.badge}</span>}

					<div className='flex flex-wrap items-center gap-2 max-lg:hidden'>
						{item.tags.map(tag => (
							<span key={tag} className='text-secondary text-sm'>
								#{tag}
							</span>
						))}
					</div>
				</Link>
			))}
		</>
	)
}
