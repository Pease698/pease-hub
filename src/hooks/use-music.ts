'use client'

import { useEffect } from 'react'
import { create } from 'zustand'
import { MUSIC_TRACKS, type MusicTrack } from '@/config/music'
import { getAudio } from '@/lib/music-player'

export type RepeatMode = 'one' | 'all' | 'off'

const VOLUME_STORAGE_KEY = 'pease-hub:music-volume'

interface MusicStore {
	tracks: MusicTrack[]
	currentIndex: number
	isPlaying: boolean
	isReady: boolean
	currentTime: number
	duration: number
	volume: number
	muted: boolean
	repeat: RepeatMode

	init: () => void
	play: () => void
	pause: () => void
	toggle: () => void
	next: () => void
	prev: () => void
	playTrack: (index: number) => void
	seek: (time: number) => void
	setVolume: (volume: number) => void
	toggleMute: () => void
	cycleRepeat: () => void
}

let initialized = false
let eventsBound = false
let playToken = 0

function safePlay() {
	const token = ++playToken
	getAudio()
		.play()
		.catch(() => {
			// 只回滚最近一次播放请求，避免快速切歌时误伤新请求
			if (token === playToken) useMusicStore.setState({ isPlaying: false })
		})
}

function applyTrack(index: number, autoplay: boolean) {
	const { tracks, currentIndex, repeat } = useMusicStore.getState()
	const track = tracks[index]
	if (!track) return

	const audio = getAudio()
	audio.loop = repeat === 'one'

	// 单曲循环 / 列表里只有一首时，下标不变也要能从头重播
	if (index === currentIndex) {
		audio.currentTime = 0
		useMusicStore.setState({ currentTime: 0 })
		if (autoplay) safePlay()
		else audio.pause()
		return
	}

	audio.src = track.src
	useMusicStore.setState({ currentIndex: index, currentTime: 0, duration: 0 })

	if (autoplay) safePlay()
}

function bindAudioEvents() {
	if (eventsBound) return
	eventsBound = true

	const audio = getAudio()

	audio.addEventListener('play', () => useMusicStore.setState({ isPlaying: true }))
	audio.addEventListener('pause', () => useMusicStore.setState({ isPlaying: false }))
	audio.addEventListener('timeupdate', () => useMusicStore.setState({ currentTime: audio.currentTime }))
	audio.addEventListener('loadedmetadata', () => useMusicStore.setState({ duration: Number.isFinite(audio.duration) ? audio.duration : 0 }))
	audio.addEventListener('durationchange', () => useMusicStore.setState({ duration: Number.isFinite(audio.duration) ? audio.duration : 0 }))
	audio.addEventListener('volumechange', () => useMusicStore.setState({ volume: audio.volume, muted: audio.muted }))
	audio.addEventListener('error', () => useMusicStore.setState({ isPlaying: false }))

	audio.addEventListener('ended', () => {
		const { repeat, tracks, currentIndex } = useMusicStore.getState()

		if (repeat === 'one') {
			audio.currentTime = 0
			safePlay()
			return
		}

		if (repeat === 'all') {
			applyTrack((currentIndex + 1) % tracks.length, true)
			return
		}

		useMusicStore.setState({ isPlaying: false })
	})
}

export const useMusicStore = create<MusicStore>((set, get) => ({
	tracks: MUSIC_TRACKS,
	currentIndex: 0,
	isPlaying: false,
	isReady: false,
	currentTime: 0,
	duration: 0,
	volume: 0.8,
	muted: false,
	repeat: 'one',

	init: () => {
		if (initialized) return
		initialized = true

		const audio = getAudio()
		bindAudioEvents()
		audio.loop = get().repeat === 'one'

		try {
			const rawVolume = window.localStorage.getItem(VOLUME_STORAGE_KEY)
			if (rawVolume !== null) {
				const savedVolume = Number(rawVolume)
				if (Number.isFinite(savedVolume) && savedVolume >= 0 && savedVolume <= 1) {
					audio.volume = savedVolume
				}
			}
		} catch {
			// localStorage 不可用时忽略
		}

		const { tracks } = get()
		if (!tracks.length) return

		// 初始曲目随机，且只在客户端执行，避免 SSR/CSR 水合不一致
		const index = Math.floor(Math.random() * tracks.length)
		audio.src = tracks[index].src
		set({ currentIndex: index, isReady: true, volume: audio.volume, muted: audio.muted })
	},

	play: () => {
		// 兜底：极端情况下用户先点了播放，再等初始化
		if (!get().isReady) get().init()

		const audio = getAudio()
		const { tracks, currentIndex, repeat } = get()

		if (!audio.src && tracks[currentIndex]) {
			audio.loop = repeat === 'one'
			audio.src = tracks[currentIndex].src
			set({ currentTime: 0, duration: 0 })
		}

		safePlay()
	},

	pause: () => getAudio().pause(),

	toggle: () => {
		if (get().isPlaying) get().pause()
		else get().play()
	},

	next: () => {
		const { tracks, currentIndex, isPlaying } = get()
		if (!tracks.length) return
		applyTrack((currentIndex + 1) % tracks.length, isPlaying)
	},

	prev: () => {
		const { tracks, currentIndex, isPlaying } = get()
		if (!tracks.length) return
		applyTrack((currentIndex - 1 + tracks.length) % tracks.length, isPlaying)
	},

	playTrack: (index: number) => applyTrack(index, true),

	seek: (time: number) => {
		const audio = getAudio()
		if (!Number.isFinite(audio.duration)) return

		const next = Math.max(0, Math.min(time, audio.duration))
		audio.currentTime = next
		set({ currentTime: next })
	},

	setVolume: (volume: number) => {
		const audio = getAudio()
		const next = Math.max(0, Math.min(volume, 1))

		audio.volume = next
		if (next > 0) audio.muted = false
		set({ volume: next, muted: audio.muted })

		try {
			window.localStorage.setItem(VOLUME_STORAGE_KEY, String(next))
		} catch {
			// localStorage 不可用时忽略
		}
	},

	toggleMute: () => {
		const audio = getAudio()
		audio.muted = !audio.muted
		set({ muted: audio.muted })
	},

	cycleRepeat: () => {
		const order: RepeatMode[] = ['one', 'all', 'off']
		const next = order[(order.indexOf(get().repeat) + 1) % order.length]

		getAudio().loop = next === 'one'
		set({ repeat: next })
	}
}))

/** 在常驻布局中调用一次：选随机曲目、绑定 audio 事件 */
export function useMusicInit() {
	const init = useMusicStore(state => state.init)

	useEffect(() => {
		init()
	}, [init])
}
