import { getCloudflareContext } from '@opennextjs/cloudflare'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
	const slug = request.nextUrl.searchParams.get('slug')
	if (!slug) return NextResponse.json({ count: 0 })

	let count: number | null = null
	try {
		const { env } = await getCloudflareContext()
		const val = await (env as any).LIKES.get(`like:${slug}`)
		if (val) count = parseInt(val) || 0
	} catch {
		// info: not running on Cloudflare (local dev), return 0
	}
	return NextResponse.json({ count: count ?? 0 })
}

export async function POST(request: NextRequest) {
	const slug = request.nextUrl.searchParams.get('slug')
	if (!slug) return NextResponse.json({ count: 0 })

	let count: number | null = null

	try {
		const { env } = await getCloudflareContext()
		const kv = (env as any).LIKES

		// 用客户端 IP 作为用户标识
		const ip = request.headers.get('cf-connecting-ip') || 'unknown'

		const today = new Date().toISOString().slice(0, 10)
		const rateKey = `rate:${slug}:${ip}:${today}`

		// 同 IP 同 slug 同一天只能 +1
		const already = await kv.get(rateKey)
		if (already) {
			const val = await kv.get(`like:${slug}`)
			count = val ? parseInt(val) || 0 : 0
			return NextResponse.json({ count, reason: 'rate_limited' })
		}

		// 写入限流标记，48 小时后清理（保证跨天后自动失效）
		await kv.put(rateKey, '1', { expirationTtl: 172800 })
		count = (parseInt((await kv.get(`like:${slug}`)) || '0') || 0) + 1
		await kv.put(`like:${slug}`, String(count))
	} catch {
		count = null
	}

	return NextResponse.json({ count: count ?? 1 })
}
