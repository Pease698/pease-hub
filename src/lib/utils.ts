import clsx, { ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function thousandsSeparator(n: string | number | any, sign: string = ',') {
	if (typeof n === 'string' || typeof n === 'number') {
		n = String(n)
		const reg = /\B(?=(\d{3})+($|\.))/g

		if (n.includes('.')) {
			const nArr = n.split('.')
			nArr[0] = nArr[0].replace(reg, `$&${sign}`)

			return nArr.join('.')
		}

		return n.replace(reg, `$&${sign}`)
	} else return 0
}

export function getFileExt(filename: string): string {
	const lower = filename.toLowerCase()
	if (lower.endsWith('.jpg')) return '.jpg'
	if (lower.endsWith('.jpeg')) return '.jpeg'
	if (lower.endsWith('.webp')) return '.webp'
	if (lower.endsWith('.png')) return '.png'
	if (lower.endsWith('.svg')) return '.svg'
	return '.png'
}

export function rand(a: number, b: number) {
	return a + Math.random() * (b - a)
}

export function getReadingStats(markdown: string): { chars: number; minutes: number } {
	const plain = markdown
		.replace(/```[\s\S]*?```/g, '')        // fenced code blocks
		.replace(/`[^`]*`/g, '')               // inline code
		.replace(/\$\$[\s\S]*?\$\$/g, '')      // block math
		.replace(/\$[^$\n]+?\$/g, '')          // inline math
		.replace(/!\[.*?\]\(.*?\)/g, '')       // images
		.replace(/\[([^\]]*)\]\(.*?\)/g, '$1') // links → keep text
		.replace(/[*~>#|]/g, '')               // bold/italic/strikethrough/blockquote/headings/tables
		.replace(/^[-*+]\s/gm, '')             // unordered list markers
		.replace(/^\d+\.\s/gm, '')             // ordered list markers
		.replace(/\n+/g, ' ')                  // newlines → space

	const cjk = (plain.match(/[一-鿿㐀-䶿]/g) || []).length
	const nonCjk = plain.replace(/[一-鿿㐀-䶿]/g, ' ')
	const engWords = nonCjk.split(/\s+/).filter(w => w.length > 0).length

	const chars = cjk + engWords
	const minutes = Math.max(1, Math.ceil(chars / 250))

	return { chars, minutes }
}
