import type { ComponentType } from 'react'
import dynamic from 'next/dynamic'

export interface ExtraEntry {
	type: 'component'
	component: ComponentType<{ blogSlug: string }>
}

const extraRegistry: Record<string, ExtraEntry> = {
	// 'three-demo': {
	// 	type: 'component',
	// 	component: dynamic(() => import('@/components/extras/three-demo'), { ssr: false })
	// }
}

export function getExtraComponent(name: string): ExtraEntry | null {
	return extraRegistry[name] ?? null
}
