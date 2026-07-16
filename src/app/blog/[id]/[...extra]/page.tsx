'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import dayjs from 'dayjs'
import { motion } from 'motion/react'
import { INIT_DELAY } from '@/consts'
import { useMarkdownRender } from '@/hooks/use-markdown-render'
import { useSize } from '@/hooks/use-size'
import { getExtraComponent } from './registry'
import { BlogSidebar } from '@/components/blog-sidebar'
import { ScrollBar } from '@/components/scroll-bar'
import { getReadingStats } from '@/lib/utils'

function BackLink({ blogSlug }: { blogSlug: string }) {
	return (
		<motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: INIT_DELAY }}>
			<Link
				href={`/blog/${blogSlug}`}
				className='text-secondary hover:text-brand group mb-6 inline-flex items-center gap-2 text-sm transition-colors'>
				<svg
					xmlns='http://www.w3.org/2000/svg'
					width='16'
					height='16'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='2'
					strokeLinecap='round'
					strokeLinejoin='round'
					className='group-hover:-translate-x-0.5 transition-transform'>
					<path d='m15 18-6-6 6-6' />
				</svg>
				返回文章
			</Link>
		</motion.div>
	)
}

function MarkdownExtra({ blogSlug, extraName }: { blogSlug: string; extraName: string }) {
	const { maxSM: isMobile } = useSize()
	const [markdown, setMarkdown] = useState<string | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [parentConfig, setParentConfig] = useState<{ date?: string; extras?: Record<string, string> } | null>(null)
	const { content, toc, loading: rendering } = useMarkdownRender(markdown || '')

	useEffect(() => {
		let cancelled = false
		setLoading(true)
		fetch(`/blogs/${encodeURIComponent(blogSlug)}/extras/${encodeURIComponent(extraName)}.md`)
			.then(res => {
				if (!res.ok) throw new Error('附加内容不存在')
				return res.text()
			})
			.then(text => {
				if (!cancelled) {
					setMarkdown(text)
					setError(null)
				}
			})
			.catch(e => {
				if (!cancelled) setError(e.message || '加载失败')
			})
			.finally(() => {
				if (!cancelled) setLoading(false)
			})
		return () => {
			cancelled = true
		}
	}, [blogSlug, extraName])

	useEffect(() => {
		let cancelled = false
		fetch(`/blogs/${encodeURIComponent(blogSlug)}/config.json`)
			.then(res => (res.ok ? res.json() : null))
			.then(config => {
				if (!cancelled && config) {
					setParentConfig(config)
				}
			})
			.catch(() => {})
		return () => {
			cancelled = true
		}
	}, [blogSlug])

	const title = parentConfig?.extras?.[extraName] ?? toc[0]?.text ?? extraName
	const stats = markdown ? getReadingStats(markdown) : { chars: 0, minutes: 0 }
	const date = parentConfig?.date ? dayjs(parentConfig.date).format('YYYY年 M月 D日') : null

	if (loading || rendering) {
		return (
			<>
				<ScrollBar />
				<div className='mx-auto max-w-[1140px] px-6 pt-24'>
					<BackLink blogSlug={blogSlug} />
				</div>
				<div className='text-secondary flex items-center justify-center text-sm'>加载中...</div>
			</>
		)
	}

	if (error) {
		return (
			<>
				<ScrollBar />
				<div className='mx-auto max-w-[1140px] px-6 pt-24'>
					<BackLink blogSlug={blogSlug} />
				</div>
				<div className='card bg-article mx-auto max-w-[1140px] static rounded-xl p-8 text-center text-sm text-red-500'>{error}</div>
			</>
		)
	}

	return (
		<>
			<ScrollBar />
			<div className='mx-auto max-w-[1140px] px-6 pt-24'>
				<BackLink blogSlug={blogSlug} />
			</div>
			<div className='mx-auto flex max-w-[1140px] justify-center gap-6 px-6 pb-12 max-sm:px-0'>
				<motion.article
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: INIT_DELAY }}
					className='card bg-article static flex-1 overflow-auto rounded-xl p-8'>
					<div>
						<div className='text-center text-xl font-semibold'>{title}</div>
						{date && <div className='text-secondary mt-2 text-center text-sm'>{date}</div>}
						<div className='text-secondary mt-2 text-center text-sm'>
							本文总计 {stats.chars} 字 | 预计阅读时间 {stats.minutes} min
						</div>
						<div className='prose mt-6 max-w-none cursor-text'>{content}</div>
					</div>
				</motion.article>

				{!isMobile && <BlogSidebar toc={toc} slug={blogSlug} />}
			</div>
		</>
	)
}

function ComponentExtra({ blogSlug, extraName }: { blogSlug: string; extraName: string }) {
	const entry = getExtraComponent(extraName)

	if (!entry) {
		return (
			<div className='mx-auto max-w-[1140px] px-6 pt-24'>
				<BackLink blogSlug={blogSlug} />
				<div className='text-secondary text-center text-sm'>组件不存在</div>
			</div>
		)
	}

	const Component = entry.component

	return (
		<div className='mx-auto max-w-[1140px] px-6 pt-24 pb-12'>
			<BackLink blogSlug={blogSlug} />
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: INIT_DELAY }}>
				{Component ? <Component blogSlug={blogSlug} /> : <div className='text-secondary text-sm'>组件加载失败</div>}
			</motion.div>
		</div>
	)
}

export default function ExtraPage() {
	const params = useParams()
	const blogSlug = params.id as string
	const extraRaw = params.extra as string[]
	const extraName = extraRaw.join('/')

	const entry = getExtraComponent(extraName)
	if (entry) {
		return <ComponentExtra blogSlug={blogSlug} extraName={extraName} />
	}

	return <MarkdownExtra blogSlug={blogSlug} extraName={extraName} />
}
