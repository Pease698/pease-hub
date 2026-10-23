'use client'

import { useEffect } from 'react'
import { create } from 'zustand'
import { MUSIC_TRACKS, type MusicTrack } from '@/config/music'
import { getAudio } from '@/lib/music-player'

export type RepeatMode = 'one' | 'all' | 'off'

const STORAGE_KEY = 'pease-hub:music-state'
const LEGACY_VOLUME_KEY = 'pease-hub:music-volume'
const SAVE_INTERVAL = 5000

type PersistedMusicState = {
	v: 1
	trackId: string
	currentTime: number
	volume: number
	muted: boolean
	repeat: RepeatMode
	updatedAt: number
}

interface MusicStore {
	tracks: MusicTrack[]
	currentIndex: number
	isPlaying: boolean
	isReady: boolean
	hasInteracted: boolean
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
let pendingSeek: number | null = null
let lastSavedAt = 0

function clamp(value: number, min: number, max: number) {
	return Math.min(max, Math.max(min, value))
}

function readPersistedState(): PersistedMusicState | null {
	if (typeof window === 'undefined') return null

	try {
		const raw = window.localStorage.getItem(STORAGE_KEY)
		if (!raw) return null

		const data = JSON.parse(raw) as Partial<PersistedMusicState>
		if (data.v !== 1 || typeof data.trackId !== 'string') return null

		return {
			v: 1,
			trackId: data.trackId,
			currentTime: typeof data.currentTime === 'number' && Number.isFinite(data.currentTime) ? Math.max(0, data.currentTime) : 0,
			volume: typeof data.volume === 'number' && Number.isFinite(data.volume) ? clamp(data.volume, 0, 1) : 0.8,
			muted: Boolean(data.muted),
			repeat: data.repeat === 'all' || data.repeat === 'off' ? data.repeat : 'one',
			updatedAt: typeof data.updatedAt === 'number' ? data.updatedAt : 0
		}
	} catch {
		return null
	}
}

function savePersistedState(force = false) {
	if (typeof window === 'undefined') return
	if (pendingSeek !== null) return // 进度还没恢复完，避免用 0 覆盖存档
	if (!useMusicStore.getState().hasInteracted) return

	const now = Date.now()
	if (!force && now - lastSavedAt < SAVE_INTERVAL) return

	const { tracks, currentIndex, currentTime, volume, muted, repeat } = useMusicStore.getState()
	const track = tracks[currentIndex]
	if (!track) return

	lastSavedAt = now

	try {
		const data: PersistedMusicState = {
			v: 1,
			trackId: track.id,
			currentTime,
			volume,
			muted,
			repeat,
			updatedAt: now
		}
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
	} catch {
		// localStorage 不可用时忽略
	}
}

function markInteracted() {
	useMusicStore.setState({ hasInteracted: true })
}

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
	pendingSeek = null
	audio.loop = repeat === 'one'

	// 单曲循环 / 列表里只有一首时，下标不变也要能从头重播
	if (index === currentIndex) {
		audio.currentTime = 0
		useMusicStore.setState({ currentTime: 0, hasInteracted: true })
		if (autoplay) safePlay()
		else audio.pause()
		savePersistedState(true)
		return
	}

	audio.src = track.src
	useMusicStore.setState({ currentIndex: index, currentTime: 0, duration: 0, hasInteracted: true })

	if (autoplay) safePlay()
	savePersistedState(true)
}

function bindAudioEvents() {
	if (eventsBound) return
	eventsBound = true

	const audio = getAudio()

	audio.addEventListener('play', () => {
		useMusicStore.setState({ isPlaying: true, hasInteracted: true })
		savePersistedState(true)
	})
	audio.addEventListener('pause', () => {
		useMusicStore.setState({ isPlaying: false })
		savePersistedState(true)
	})
	audio.addEventListener('timeupdate', () => {
		useMusicStore.setState({ currentTime: audio.currentTime })
		savePersistedState()
	})
	audio.addEventListener('loadedmetadata', () => {
		const duration = Number.isFinite(audio.duration) ? audio.duration : 0
		useMusicStore.setState({ duration })

		if (pendingSeek !== null) {
			const time = duration > 0 ? clamp(pendingSeek, 0, Math.max(0, duration - 0.5)) : 0
			audio.currentTime = time
			useMusicStore.setState({ currentTime: time })
			pendingSeek = null
			lastSavedAt = Date.now()
		}
	})
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
		savePersistedState(true)
	})

	// 关页/切后台时强制落盘，避免丢失最后几秒进度
	window.addEventListener('pagehide', () => savePersistedState(true))
	document.addEventListener('visibilitychange', () => {
		if (document.visibilityState === 'hidden') savePersistedState(true)
	})
}

export const useMusicStore = create<MusicStore>((set, get) => ({
	tracks: MUSIC_TRACKS,
	currentIndex: 0,
	isPlaying: false,
	isReady: false,
	hasInteracted: false,
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

		const { tracks } = get()
		if (!tracks.length) return

		const saved = readPersistedState()
		const savedIndex = saved ? tracks.findIndex(track => track.id === saved.trackId) : -1

		if (saved && savedIndex >= 0) {
			audio.volume = saved.volume
			audio.muted = saved.muted
			audio.loop = saved.repeat === 'one'
			audio.src = tracks[savedIndex].src
			pendingSeek = saved.currentTime
			lastSavedAt = Date.now()

			set({
				currentIndex: savedIndex,
				isReady: true,
				hasInteracted: true,
				repeat: saved.repeat,
				volume: saved.volume,
				muted: saved.muted
			})
			return
		}

		// 没有有效存档：尝试迁移旧版音量设置，然后随机选曲
		try {
			const legacyVolume = window.localStorage.getItem(LEGACY_VOLUME_KEY)
			if (legacyVolume !== null && legacyVolume !== '') {
				const volume = Number(legacyVolume)
				if (Number.isFinite(volume) && volume >= 0 && volume <= 1) audio.volume = volume
			}
		} catch {
			// localStorage 不可用时忽略
		}

		audio.loop = get().repeat === 'one'
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

		markInteracted()
		safePlay()
	},

	pause: () => {
		markInteracted()
		getAudio().pause()
	},

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

		pendingSeek = null
		const next = clamp(time, 0, audio.duration)
		audio.currentTime = next
		set({ currentTime: next, hasInteracted: true })
		savePersistedState(true)
	},

	setVolume: (volume: number) => {
		const audio = getAudio()
		const next = clamp(volume, 0, 1)

		audio.volume = next
		if (next > 0) audio.muted = false
		set({ volume: next, muted: audio.muted })
		savePersistedState(true)
	},

	toggleMute: () => {
		const audio = getAudio()
		audio.muted = !audio.muted
		set({ muted: audio.muted })
		savePersistedState(true)
	},

	cycleRepeat: () => {
		const order: RepeatMode[] = ['one', 'all', 'off']
		const next = order[(order.indexOf(get().repeat) + 1) % order.length]

		getAudio().loop = next === 'one'
		set({ repeat: next, hasInteracted: true })
		savePersistedState(true)
	}
}))

/** 在常驻布局中调用一次：恢复/随机曲目、绑定 audio 事件 */
export function useMusicInit() {
	const init = useMusicStore(state => state.init)

	useEffect(() => {
		init()
	}, [init])
}
