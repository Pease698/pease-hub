import type { Metadata } from 'next'
import siteContent from '@/config/site-content.json'

export const metadata: Metadata = {
	title: `音乐 | ${siteContent.meta.title}`,
	description: 'Pease 的音乐播放器，支持播放列表、进度跳转与音量控制。'
}

export default function MusicLayout({ children }: { children: React.ReactNode }) {
	return children
}
