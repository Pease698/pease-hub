'use client'

import { Pause, Play, Repeat, Repeat1, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react'
import MusicProgress from '@/components/music-progress'
import { useMusicStore } from '@/hooks/use-music'
import { cn } from '@/lib/utils'
import MusicSVG from '@/svgs/music.svg'

function formatTime(seconds: number) {
	if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
	const minutes = Math.floor(seconds / 60)
	const rest = Math.floor(seconds % 60)
	return `${minutes}:${String(rest).padStart(2, '0')}`
}

/** 单独订阅时间，避免整页随 timeupdate 重渲染 */
function MusicTime() {
	const currentTime = useMusicStore(state => state.currentTime)
	const duration = useMusicStore(state => state.duration)

	return (
		<div className='text-secondary mt-2 flex justify-between text-xs tabular-nums'>
			<span>{formatTime(currentTime)}</span>
			<span>{formatTime(duration)}</span>
		</div>
	)
}

export default function MusicPage() {
	const tracks = useMusicStore(state => state.tracks)
	const currentIndex = useMusicStore(state => state.currentIndex)
	const isPlaying = useMusicStore(state => state.isPlaying)
	const isReady = useMusicStore(state => state.isReady)
	const volume = useMusicStore(state => state.volume)
	const muted = useMusicStore(state => state.muted)
	const repeat = useMusicStore(state => state.repeat)

	const toggle = useMusicStore(state => state.toggle)
	const next = useMusicStore(state => state.next)
	const prev = useMusicStore(state => state.prev)
	const playTrack = useMusicStore(state => state.playTrack)
	const setVolume = useMusicStore(state => state.setVolume)
	const toggleMute = useMusicStore(state => state.toggleMute)
	const cycleRepeat = useMusicStore(state => state.cycleRepeat)

	const track = tracks[currentIndex]
	const repeatLabel = repeat === 'one' ? '单曲循环' : repeat === 'all' ? '列表循环' : '不循环'

	return (
		<div className='flex flex-col items-center px-6 pt-32 pb-12 max-sm:px-4'>
			<div className='w-full max-w-[900px]'>
				<h1 className='mb-6 text-3xl font-bold'>音乐</h1>

				<div className='bg-card w-full rounded-[40px] border p-6 backdrop-blur sm:p-8'>
					<div className='flex items-center gap-5'>
						<div className='bg-brand/10 flex size-20 shrink-0 items-center justify-center rounded-3xl sm:size-24'>
							<MusicSVG className='size-10 sm:size-12' />
						</div>

						<div className='min-w-0 flex-1'>
							<div className='truncate text-xl font-semibold sm:text-2xl'>{isReady && track ? track.title : '—'}</div>
							<div className='text-secondary mt-1 truncate text-sm'>{isReady && track ? (track.artist ?? '未知歌手') : '未知歌手'}</div>
						</div>
					</div>

					<div className='mt-6'>
						<MusicProgress />
						<MusicTime />
					</div>

					<div className='mt-4 flex flex-wrap items-center justify-between gap-4'>
						<div className='flex items-center gap-2'>
							<button
								type='button'
								onClick={prev}
								aria-label='上一首'
								className='text-secondary hover:text-primary flex size-10 items-center justify-center rounded-full transition-colors'>
								<SkipBack className='size-5' />
							</button>

							<button
								type='button'
								onClick={toggle}
								aria-label={isPlaying ? '暂停' : '播放'}
								className='bg-linear flex size-12 items-center justify-center rounded-full transition-opacity hover:opacity-80'>
								{isPlaying ? <Pause className='size-5' /> : <Play className='ml-0.5 size-5' />}
							</button>

							<button
								type='button'
								onClick={next}
								aria-label='下一首'
								className='text-secondary hover:text-primary flex size-10 items-center justify-center rounded-full transition-colors'>
								<SkipForward className='size-5' />
							</button>

							<button
								type='button'
								onClick={cycleRepeat}
								aria-label={repeatLabel}
								title={repeatLabel}
								className={cn(
									'flex size-10 items-center justify-center rounded-full transition-colors',
									repeat === 'off' ? 'text-secondary hover:text-primary' : 'text-brand'
								)}>
								{repeat === 'one' ? <Repeat1 className='size-5' /> : <Repeat className='size-5' />}
							</button>
						</div>

						<div className='flex items-center gap-2'>
							<button
								type='button'
								onClick={toggleMute}
								aria-label={muted ? '取消静音' : '静音'}
								className='text-secondary hover:text-primary flex size-10 items-center justify-center rounded-full transition-colors'>
								{muted || volume === 0 ? <VolumeX className='size-5' /> : <Volume2 className='size-5' />}
							</button>
							<input
								type='range'
								aria-label='音量'
								min={0}
								max={1}
								step={0.01}
								value={muted ? 0 : volume}
								onChange={event => setVolume(Number(event.target.value))}
								className='w-24 cursor-pointer accent-[var(--color-brand)]'
							/>
						</div>
					</div>
				</div>

				<h2 className='mt-10 mb-3 text-lg font-semibold'>播放列表</h2>

				<div className='bg-card w-full rounded-[40px] border p-2 backdrop-blur'>
					{tracks.map((item, index) => {
						const active = isReady && index === currentIndex

						return (
							<button
								key={item.id}
								type='button'
								onClick={() => playTrack(index)}
								aria-current={active ? 'true' : undefined}
								className={cn(
									'flex w-full items-center gap-4 rounded-[28px] px-4 py-3 text-left transition-colors',
									active ? 'bg-brand/10' : 'hover:bg-black/5'
								)}>
								<span className='text-secondary w-6 shrink-0 text-center text-xs tabular-nums'>
									{active && isPlaying ? <span className='text-brand'>♫</span> : index + 1}
								</span>

								<span className='min-w-0 flex-1'>
									<span className={cn('block truncate text-sm', active ? 'text-brand font-medium' : 'text-primary')}>{item.title}</span>
									<span className='text-secondary mt-0.5 block truncate text-xs'>{item.artist ?? '未知歌手'}</span>
								</span>

								{active && <span className='text-brand shrink-0 text-xs'>{isPlaying ? '正在播放' : '已暂停'}</span>}
							</button>
						)
					})}
				</div>
			</div>
		</div>
	)
}
