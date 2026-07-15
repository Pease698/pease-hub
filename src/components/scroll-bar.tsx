'use client'

import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { useSize } from '@/hooks/use-size'

export function ScrollBar() {
	const { maxSM: isMobile } = useSize()
	const trackRef = useRef<HTMLDivElement>(null)
	const thumbRef = useRef<HTMLDivElement>(null)
	const [thumbTop, setThumbTop] = useState(0)
	const [thumbHeight, setThumbHeight] = useState(0)
	const [hovered, setHovered] = useState(false)
	const [dragging, setDragging] = useState(false)

	const thumbHeightRef = useRef(0)
	const draggingRef = useRef(false)
	const grabOffsetRef = useRef(0)

	const isActive = hovered || dragging

	const updateThumb = useCallback(() => {
		const docH = document.documentElement.scrollHeight - window.innerHeight
		const track = trackRef.current
		if (!track || docH <= 0) return

		const trackH = track.clientHeight
		const ratio = window.innerHeight / document.documentElement.scrollHeight
		const tHeight = Math.max(30, ratio * trackH)
		const tTop = (window.scrollY / docH) * (trackH - tHeight)

		thumbHeightRef.current = tHeight
		setThumbTop(tTop)
		setThumbHeight(tHeight)
	}, [])

	useLayoutEffect(() => {
		updateThumb()

		const onScroll = () => {
			if (!draggingRef.current) updateThumb()
		}
		window.addEventListener('scroll', onScroll, { passive: true })
		window.addEventListener('resize', updateThumb)

		// Detect content height changes after page load (e.g. async markdown rendering)
		const observer = new ResizeObserver(() => updateThumb())
		observer.observe(document.documentElement)

		return () => {
			window.removeEventListener('scroll', onScroll)
			window.removeEventListener('resize', updateThumb)
			observer.disconnect()
		}
	}, [updateThumb])

	const handleTrackClick = useCallback((e: React.MouseEvent) => {
		const track = trackRef.current
		if (!track) return

		const target = e.target as HTMLElement
		if (target !== trackRef.current && target.dataset.track !== 'true') return

		const rect = track.getBoundingClientRect()
		const tH = thumbHeightRef.current
		const docH = document.documentElement.scrollHeight - window.innerHeight
		if (docH <= 0) return

		const ratio = Math.max(0, Math.min(1, (e.clientY - rect.top - tH / 2) / (rect.height - tH)))
		document.documentElement.scrollTop = ratio * docH
	}, [])

	const handleThumbMouseDown = useCallback((e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()

		draggingRef.current = true
		setDragging(true)

		// Disable smooth scrolling during drag so scrollTop moves
		// in lockstep with the thumb (the global scroll-behavior:
		// smooth on <html> would otherwise animate every assignment).
		document.documentElement.style.scrollBehavior = 'auto'

		const mousedownRect = trackRef.current!.getBoundingClientRect()
		const currentTop = parseFloat(thumbRef.current!.style.top) || 0
		grabOffsetRef.current = (e.clientY - mousedownRect.top) - currentTop

		// Cache values that stay constant during a drag
		const docH = document.documentElement.scrollHeight - window.innerHeight
		const trackable = mousedownRect.height - thumbHeightRef.current

		const onMove = (ev: MouseEvent) => {
			const track = trackRef.current
			const thumb = thumbRef.current
			if (!track || !thumb) return

			const rect = track.getBoundingClientRect()
			const trackRelativeY = ev.clientY - rect.top
			const effectiveY = trackRelativeY - grabOffsetRef.current
			const ratio = Math.max(0, Math.min(1, effectiveY / trackable))

			thumb.style.top = `${ratio * trackable}px`
			document.documentElement.scrollTop = ratio * docH
		}

		const onUp = () => {
			draggingRef.current = false
			setDragging(false)
			document.removeEventListener('mousemove', onMove)
			document.removeEventListener('mouseup', onUp)

			document.documentElement.style.scrollBehavior = ''

			// Sync React state to the final DOM position, then re-sync
			// from scrollY to correct any rounding difference
			const finalTop = parseFloat(thumbRef.current!.style.top) || 0
			setThumbTop(finalTop)
			requestAnimationFrame(() => updateThumb())
		}

		document.addEventListener('mousemove', onMove)
		document.addEventListener('mouseup', onUp)
	}, [])

	if (isMobile) return null

	const barWidth = isActive ? 'w-2' : 'w-1'
	const thumbBg = isActive ? 'bg-brand/60' : 'bg-brand/40'

	return (
		<div className='fixed right-1 top-0 z-40 flex h-full items-center'>
			<div
				ref={trackRef}
				data-track='true'
				className={`${barWidth} relative flex h-[60vh] flex-col rounded-full bg-black/[0.06] transition-[width] duration-200`}
				onMouseEnter={() => setHovered(true)}
				onMouseLeave={() => setHovered(false)}
				onClick={handleTrackClick}
			>
				<div
					ref={thumbRef}
					className={`absolute left-0 rounded-full ${thumbBg} transition-[width,opacity] duration-200`}
					style={{
						top: thumbTop,
						height: thumbHeight,
						width: isActive ? 8 : 4,
						cursor: dragging ? 'grabbing' : 'grab',
						transition: dragging ? 'none' : undefined
					}}
					onMouseDown={handleThumbMouseDown}
				/>
			</div>
		</div>
	)
}
