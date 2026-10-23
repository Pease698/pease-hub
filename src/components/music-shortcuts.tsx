'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { Keyboard, X } from 'lucide-react'
import { DialogModal } from '@/components/dialog-modal'

const SHORTCUTS = [
	{ label: '播放 / 暂停', keys: ['Space'] },
	{ label: '快退 / 快进 5 秒', keys: ['←', '/', '→'] },
	{ label: '上一首', keys: ['Shift', '+', '←'] },
	{ label: '下一首', keys: ['Shift', '+', '→'] },
	{ label: '音量 +5% / −5%', keys: ['↑', '/', '↓'] }
]

function Keycap({ children }: { children: ReactNode }) {
	return (
		<kbd className='border-primary/10 text-primary inline-flex h-7 min-w-7 items-center justify-center rounded-md border bg-white/75 px-2 font-mono text-[11px] font-semibold shadow-[inset_0_-2px_0_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.04)]'>
			{children}
		</kbd>
	)
}

interface ShortcutHelpDialogProps {
	open: boolean
	onClose: () => void
}

export function ShortcutHelpDialog({ open, onClose }: ShortcutHelpDialogProps) {
	const dialogRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!open) return
		const frame = requestAnimationFrame(() => dialogRef.current?.focus())
		return () => cancelAnimationFrame(frame)
	}, [open])

	return (
		<DialogModal open={open} onClose={onClose} className='card w-[min(92vw,460px)] p-6'>
			<div ref={dialogRef} role='dialog' aria-modal='true' aria-labelledby='music-shortcuts-title' tabIndex={-1} className='outline-none'>
				<div className='flex items-start justify-between gap-4'>
					<div className='flex items-center gap-2'>
						<Keyboard className='text-brand size-5' />
						<div>
							<h2 id='music-shortcuts-title' className='text-lg font-semibold'>
								快捷键
							</h2>
							<p className='text-secondary mt-0.5 text-xs'>仅在音乐页面生效</p>
						</div>
					</div>

					<button
						type='button'
						onClick={onClose}
						aria-label='关闭快捷键帮助'
						className='text-secondary hover:text-primary flex size-8 items-center justify-center rounded-full transition-colors'>
						<X className='size-4' />
					</button>
				</div>

				<div className='mt-5 space-y-1.5'>
					{SHORTCUTS.map(item => (
						<div key={item.label} className='flex flex-wrap items-center justify-between gap-3 rounded-2xl px-3 py-2.5 odd:bg-black/[0.03]'>
							<span className='text-secondary text-sm'>{item.label}</span>
							<span className='flex shrink-0 items-center gap-1'>
								{item.keys.map((key, index) =>
									key === '+' || key === '/' ? (
										<span key={`${key}-${index}`} className='text-secondary/70 px-0.5 text-[10px]'>
											{key}
										</span>
									) : (
										<Keycap key={`${key}-${index}`}>{key}</Keycap>
									)
								)}
							</span>
						</div>
					))}
				</div>
			</div>
		</DialogModal>
	)
}
