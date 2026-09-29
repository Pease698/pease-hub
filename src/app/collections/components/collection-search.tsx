'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { collectTagOptions, type CollectionArticle } from '@/lib/collections'

type CollectionSearchProps = {
	articles: CollectionArticle[]
	keyword: string
	onKeywordChange: (value: string) => void
	selectedTags: Set<string>
	onSelectedTagsChange: (next: Set<string>) => void
	/** 当前命中数量，由页面统一计算后传入 */
	resultCount: number
}

export function CollectionSearch({ articles, keyword, onKeywordChange, selectedTags, onSelectedTagsChange, resultCount }: CollectionSearchProps) {
	// 各标签在"当前关键词 + 当前已选标签 + 该标签"下的候选命中数
	const tagOptions = useMemo(() => collectTagOptions(articles, keyword, selectedTags), [articles, keyword, selectedTags])

	const toggleTag = (tag: string) => {
		const next = new Set(selectedTags)
		if (next.has(tag)) {
			next.delete(tag)
		} else {
			next.add(tag)
		}
		onSelectedTagsChange(next)
	}

	const hasFilter = keyword.trim() !== '' || selectedTags.size > 0

	return (
		<div className='mb-8 w-full max-w-[1200px] space-y-4'>
			<input
				type='text'
				value={keyword}
				onChange={e => onKeywordChange(e.target.value)}
				placeholder='搜索专栏文章标题...'
				className='bg-card focus:border-brand/60 mx-auto block w-full max-w-md rounded-lg border px-4 py-2 text-sm transition-colors focus:outline-none'
			/>

			{tagOptions.length > 0 && (
				<div className='flex flex-wrap justify-center gap-2'>
					<button
						type='button'
						onClick={() => onSelectedTagsChange(new Set())}
						className={cn(
							'rounded-full border px-4 py-1.5 text-sm transition-colors',
							selectedTags.size === 0 ? 'bg-brand border-transparent text-white' : 'bg-card text-secondary hover:border-brand/40 hover:text-brand'
						)}>
						全部
					</button>

					{tagOptions.map(({ tag, count }) => {
						const selected = selectedTags.has(tag)
						// 未选中且在"加入后"会归零的标签置灰，避免点了就空
						const disabled = !selected && count === 0

						return (
							<button
								key={tag}
								type='button'
								disabled={disabled}
								onClick={() => toggleTag(tag)}
								className={cn(
									'rounded-full border px-4 py-1.5 text-sm transition-colors',
									selected
										? 'bg-brand border-transparent text-white'
										: disabled
											? 'bg-card text-secondary/40 cursor-not-allowed'
											: 'bg-card text-secondary hover:border-brand/40 hover:text-brand'
								)}>
								#{tag}
								<span className={cn('ml-1 text-xs', selected ? 'text-white/70' : 'text-secondary/60')}>{count}</span>
							</button>
						)
					})}
				</div>
			)}

			{hasFilter && (
				<div className='text-secondary flex items-center justify-center gap-3 text-sm'>
					<span>命中 {resultCount} 篇</span>
					<button
						type='button'
						onClick={() => {
							onKeywordChange('')
							onSelectedTagsChange(new Set())
						}}
						className='hover:text-brand underline-offset-2 transition-colors hover:underline'>
						清空筛选
					</button>
				</div>
			)}
		</div>
	)
}
