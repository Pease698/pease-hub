'use client'

import { useEffect } from 'react'
import { useMusicStore } from '@/hooks/use-music'

function isTextInput(target: EventTarget | null) {
	if (!(target instanceof HTMLElement)) return false
	if (target.isContentEditable) return true
	return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

function isRangeInput(target: EventTarget | null) {
	return target instanceof HTMLInputElement && target.type === 'range'
}

function isSpaceTarget(target: EventTarget | null) {
	if (isTextInput(target)) return true
	return target instanceof HTMLElement && ['BUTTON', 'A'].includes(target.tagName)
}

/**
 * /music 页面快捷键：
 * Space 播放/暂停；←/→ 快退/快进 5 秒；Shift+←/→ 上一首/下一首；↑/↓ 音量 ±5%
 */
export function useMusicHotkeys({ enabled = true }: { enabled?: boolean } = {}) {
	useEffect(() => {
		if (!enabled) return

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.ctrlKey || event.metaKey || event.altKey) return

			const { code } = event
			const isSpace = code === 'Space'

			// 输入框/下拉框内不拦截；进度条、音量条保留原生方向键行为
			if (!isSpace && isTextInput(event.target)) return
			// 在按钮/链接上按 Space 交给浏览器，避免触发两次
			if (isSpace && !isRangeInput(event.target) && (isSpaceTarget(event.target) || event.repeat)) return

			const store = useMusicStore.getState()

			switch (code) {
				case 'Space':
					event.preventDefault()
					store.toggle()
					break
				case 'ArrowLeft':
					event.preventDefault()
					if (event.shiftKey) store.prev()
					else store.seek(store.currentTime - 5)
					break
				case 'ArrowRight':
					event.preventDefault()
					if (event.shiftKey) store.next()
					else store.seek(store.currentTime + 5)
					break
				case 'ArrowUp':
					event.preventDefault()
					store.setVolume(store.volume + 0.05)
					break
				case 'ArrowDown':
					event.preventDefault()
					store.setVolume(store.volume - 0.05)
					break
				default:
					break
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [enabled])
}
