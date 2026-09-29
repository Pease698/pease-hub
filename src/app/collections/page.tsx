'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { INIT_DELAY } from '@/consts'
import { useSize } from '@/hooks/use-size'
import { loadCollections, type CollectionItem } from '@/lib/collections'

export default function CollectionsPage() {
	const [collections, setCollections] = useState<CollectionItem[]>([])
	const [loading, setLoading] = useState(true)
	const { maxSM } = useSize()

	useEffect(() => {
		let cancelled = false
		loadCollections()
			.then(list => {
				if (!cancelled) setCollections(list)
			})
			.finally(() => {
				if (!cancelled) setLoading(false)
			})
		return () => {
			cancelled = true
		}
	}, [])

	return (
		<div className='flex flex-col items-center justify-center px-6 pt-32 pb-12'>
			{loading && <div className='text-secondary py-10 text-center text-sm'>加载中...</div>}
			{!loading && collections.length === 0 && <div className='text-secondary py-10 text-center text-sm'>暂无专栏</div>}

			<div className='grid w-full max-w-[1200px] grid-cols-2 gap-6 max-md:grid-cols-1'>
				{collections.map((collection, index) => (
					<motion.div
						key={collection.slug}
						initial={{ opacity: 0, scale: 0.9 }}
						{...(maxSM ? { animate: { opacity: 1, scale: 1 } } : { whileInView: { opacity: 1, scale: 1 } })}
						transition={{ delay: INIT_DELAY + index * 0.08 }}
						className='h-full'>
						<Link
							href={`/collections/${collection.slug}`}
							className='card relative flex h-full flex-col gap-4 transition-opacity hover:opacity-90'>
							<div className='flex items-start gap-4'>
								{collection.cover ? (
									<img src={collection.cover} alt={collection.title} className='h-16 w-16 shrink-0 rounded-xl border object-cover' />
								) : (
									<div className='text-secondary grid h-16 w-16 shrink-0 place-items-center rounded-xl border bg-white/60 text-2xl'>+</div>
								)}

								<div className='flex-1'>
									<div className='flex items-center gap-2'>
										<h3 className='text-lg font-semibold'>{collection.title}</h3>
										<span className='text-secondary text-sm'>{collection.articles.length} 篇</span>
									</div>
								</div>
							</div>

							{collection.summary && <p className='text-secondary text-sm leading-relaxed'>{collection.summary}</p>}

							<div className='mt-auto flex flex-wrap gap-2'>
								<span className='bg-card hover:bg-bg rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors'>查看专栏</span>
							</div>
						</Link>
					</motion.div>
				))}
			</div>
		</div>
	)
}
