'use client'

import Link from 'next/link'
import { Search } from 'lucide-react'

/**
 * 搜索入口：外观是搜索框，实际是个链接按钮。
 * 点击后进入 /collections/search，只有那时才加载全部专栏文章与标签。
 * （不用真实 <input>：能聚焦却打不了字容易被误认为坏了）
 */
export function CollectionSearchEntry({ href = '/collections/search' }: { href?: string }) {
	return (
		<Link
			href={href}
			className='bg-card text-secondary hover:border-brand/40 hover:text-brand mb-8 flex w-full max-w-md items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors'>
			<Search className='h-4 w-4 shrink-0' />
			<span>点击搜索专栏文章、标签…</span>
		</Link>
	)
}
