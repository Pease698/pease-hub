'use client'

import { useMemo } from 'react'
import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from './stores/config-store'
import { CARD_SPACING } from '@/consts'
import { useBlogIndex } from '@/hooks/use-blog-index'
import Link from 'next/link'
import { HomeDraggableLayer } from './home-draggable-layer'

export default function ShareCard() {
	const center = useCenterStore()
	const { cardStyles, siteContent } = useConfigStore()
	const { items, loading } = useBlogIndex()
	const styles = cardStyles.shareCard
	const hiCardStyles = cardStyles.hiCard
	const socialButtonsStyles = cardStyles.socialButtons

	const randomBlog = useMemo(() => {
		if (items.length === 0) return null
		return items[Math.floor(Math.random() * items.length)]
	}, [items])

	const x = styles.offsetX !== null ? center.x + styles.offsetX : center.x + hiCardStyles.width / 2 - socialButtonsStyles.width
	const y = styles.offsetY !== null ? center.y + styles.offsetY : center.y + hiCardStyles.height / 2 + CARD_SPACING + socialButtonsStyles.height + CARD_SPACING

	return (
		<HomeDraggableLayer cardKey='shareCard' x={x} y={y} width={styles.width} height={styles.height}>
			<Card order={styles.order} width={styles.width} height={styles.height} x={x} y={y}>
				{siteContent.enableChristmas && (
					<>
						<img
							src='/images/christmas/snow-12.webp'
							alt='Christmas decoration'
							className='pointer-events-none absolute'
							style={{ width: 120, left: -12, top: -12, opacity: 0.8 }}
						/>
					</>
				)}

				<h2 className='text-secondary text-sm'>随机推荐</h2>

				{loading ? (
					<div className='flex h-[60px] items-center justify-center'>
						<span className='text-secondary text-xs'>加载中...</span>
					</div>
				) : randomBlog ? (
					<Link href={`/blog/${randomBlog.slug}`} className='mt-2 block space-y-2'>
						<div className='flex items-center'>
							<div className='relative mr-3 h-12 w-12 shrink-0 overflow-hidden rounded-xl'>
								{randomBlog.cover ? (
									<img src={randomBlog.cover} alt={randomBlog.title} className='h-full w-full object-cover' />
								) : (
									<div className='text-secondary grid h-full w-full place-items-center rounded-xl bg-white/60'>+</div>
								)}
							</div>
							<h3 className='text-sm font-medium'>{randomBlog.title || randomBlog.slug}</h3>
						</div>
						{randomBlog.summary && <p className='text-secondary line-clamp-3 text-xs'>{randomBlog.summary}</p>}
					</Link>
				) : (
					<div className='flex h-[60px] items-center justify-center'>
						<span className='text-secondary text-xs'>暂无文章</span>
					</div>
				)}
			</Card>
		</HomeDraggableLayer>
	)
}
