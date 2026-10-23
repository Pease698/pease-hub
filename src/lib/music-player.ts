/**
 * 全局唯一的 HTMLAudioElement。
 * 只在浏览器端懒创建，卡片和 /music 页面共用同一个播放器，
 * 避免出现两个 audio 同时播放、状态不同步的问题。
 */
let audio: HTMLAudioElement | null = null

export function getAudio(): HTMLAudioElement {
	if (typeof window === 'undefined') {
		throw new Error('getAudio() can only be called in the browser')
	}

	if (!audio) {
		audio = new Audio()
		// 只预加载元数据，避免用户没点播放就下载整首音频
		audio.preload = 'metadata'
		audio.volume = 0.8
	}

	return audio
}
