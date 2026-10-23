'use client'

import { useMusicStore } from '@/hooks/use-music'
import { cn } from '@/lib/utils'

interface MusicProgressProps {
	/** 卡片内使用的紧凑样式：不显示拖拽手柄，仅支持点击跳转 */
	compact?: boolean
	className?: string
}

export default function MusicProgress({ compact = false, className }: MusicProgressProps) {
	const currentTime = useMusicStore(state => state.currentTime)
	const duration = useMusicStore(state => state.duration)
	const seek = useMusicStore(state => state.seek)

	const max = Number.isFinite(duration) && duration > 0 ? duration : 0
	const value = max > 0 ? Math.min(currentTime, max) : 0
	const percent = max > 0 ? (value / max) * 100 : 0

	return (
		<input
			type='range'
			aria-label='播放进度'
			min={0}
			max={max}
			step={0.1}
			value={value}
			disabled={max <= 0}
			onChange={event => seek(Number(event.target.value))}
			onClick={event => event.stopPropagation()}
			onPointerDown={event => event.stopPropagation()}
			style={{ '--progress': `${percent}%` } as React.CSSProperties}
			className={cn('music-progress w-full', compact && 'music-progress--compact', className)}
		/>
	)
}
