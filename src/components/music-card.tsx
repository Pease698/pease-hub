'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Pause } from 'lucide-react'
import clsx from 'clsx'
import Card from '@/components/card'
import MusicProgress from '@/components/music-progress'
import { useCenterStore } from '@/hooks/use-center'
import { useMusicStore } from '@/hooks/use-music'
import { useConfigStore } from '../app/(home)/stores/config-store'
import { CARD_SPACING } from '@/consts'
import MusicSVG from '@/svgs/music.svg'
import PlaySVG from '@/svgs/play.svg'
import { HomeDraggableLayer } from '../app/(home)/home-draggable-layer'

export default function MusicCard() {
	const pathname = usePathname()
	const center = useCenterStore()
	const { cardStyles, siteContent } = useConfigStore()
	const styles = cardStyles.musicCard
	const hiCardStyles = cardStyles.hiCard
	const clockCardStyles = cardStyles.clockCard
	const calendarCardStyles = cardStyles.calendarCard

	const tracks = useMusicStore(state => state.tracks)
	const currentIndex = useMusicStore(state => state.currentIndex)
	const isPlaying = useMusicStore(state => state.isPlaying)
	const isReady = useMusicStore(state => state.isReady)
	const toggle = useMusicStore(state => state.toggle)

	const track = tracks[currentIndex]
	const isHomePage = pathname === '/'

	const position = useMemo(() => {
		// 非首页时固定在视口右下角
		if (!isHomePage) {
			return {
				x: center.width - styles.width - 16,
				y: center.height - styles.height - 16
			}
		}

		// 首页默认位置
		return {
			x: styles.offsetX !== null ? center.x + styles.offsetX : center.x + CARD_SPACING + hiCardStyles.width / 2 - styles.offset,
			y: styles.offsetY !== null ? center.y + styles.offsetY : center.y - clockCardStyles.offset + CARD_SPACING + calendarCardStyles.height + CARD_SPACING
		}
	}, [isHomePage, center, styles, hiCardStyles, clockCardStyles, calendarCardStyles])

	const { x, y } = position

	// 音乐页自带完整播放器，不再显示悬浮卡
	if (pathname === '/music') return null

	// 非首页且未播放时隐藏
	if (!isHomePage && !isPlaying) return null

	return (
		<HomeDraggableLayer cardKey='musicCard' x={x} y={y} width={styles.width} height={styles.height}>
			<Card order={styles.order} width={styles.width} height={styles.height} x={x} y={y} className={clsx('flex items-center gap-3', !isHomePage && 'fixed')}>
				{siteContent.enableChristmas && (
					<>
						<img
							src='/images/christmas/snow-10.webp'
							alt='Christmas decoration'
							className='pointer-events-none absolute'
							style={{ width: 120, left: -8, top: -12, opacity: 0.8 }}
						/>
						<img
							src='/images/christmas/snow-11.webp'
							alt='Christmas decoration'
							className='pointer-events-none absolute'
							style={{ width: 80, right: -10, top: -12, opacity: 0.8 }}
						/>
					</>
				)}

				<Link href='/music' aria-label='打开音乐页面' className='shrink-0'>
					<MusicSVG className='h-8 w-8' />
				</Link>

				<div className='min-w-0 flex-1'>
					<Link
						href='/music'
						title={isReady && track ? `${track.title}${track.artist ? ` - ${track.artist}` : ''}` : undefined}
						className='text-secondary hover:text-primary block truncate text-sm transition-colors'>
						{isReady && track ? track.title : '—'}
					</Link>

					<div className='mt-1'>
						<MusicProgress compact />
					</div>
				</div>

				<button
					type='button'
					onClick={toggle}
					aria-label={isPlaying ? '暂停' : '播放'}
					className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white transition-opacity hover:opacity-80'>
					{isPlaying ? <Pause className='text-brand h-4 w-4' /> : <PlaySVG className='text-brand ml-1 h-4 w-4' />}
				</button>
			</Card>
		</HomeDraggableLayer>
	)
}
