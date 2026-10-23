import type { Metadata } from 'next'

// 不覆盖 title，沿用根布局的站点标题
export const metadata: Metadata = {
	description: 'Pease 的音乐播放器，支持播放列表、进度跳转与音量控制。'
}

export default function MusicLayout({ children }: { children: React.ReactNode }) {
	return children
}
