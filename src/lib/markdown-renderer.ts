import { marked } from 'marked'
import type { Tokens } from 'marked'

export type TocItem = { id: string; text: string; level: number }

export interface MarkdownRenderResult {
	html: string
	toc: TocItem[]
}

export function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g, '')
		.trim()
		.replace(/\s+/g, '-')
}

// Callout type configuration \u2014 icons adapted from Material Design Icons (Apache 2.0)
interface CalloutConfig {
	icon: string
	label: string
}

const CALLOUT_CONFIG: Record<string, CalloutConfig> = {
	note: {
		icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M13 9h-2V7h2m0 10h-2v-6h2m-1-9A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2"/></svg>',
		label: 'Note'
	},
	tip: {
		icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M17.66 11.2c-.23-.3-.51-.56-.77-.82-.67-.6-1.43-1.03-2.07-1.66C13.33 7.26 13 4.85 13.95 3c-.95.23-1.78.75-2.49 1.32-2.59 2.08-3.61 5.75-2.39 8.9.04.1.08.2.08.33 0 .22-.15.42-.35.5-.23.1-.47.04-.66-.12a.6.6 0 0 1-.14-.17c-1.13-1.43-1.31-3.48-.55-5.12C5.78 10 4.87 12.3 5 14.47c.06.5.12 1 .29 1.5.14.6.41 1.2.71 1.73 1.08 1.73 2.95 2.97 4.96 3.22 2.14.27 4.43-.12 6.07-1.6 1.83-1.66 2.47-4.32 1.53-6.6l-.13-.26c-.21-.46-.77-1.26-.77-1.26m-3.16 6.3c-.28.24-.74.5-1.1.6-1.12.4-2.24-.16-2.9-.82 1.19-.28 1.9-1.16 2.11-2.05.17-.8-.15-1.46-.28-2.23-.12-.74-.1-1.37.17-2.06.19.38.39.76.63 1.06.77 1 1.98 1.44 2.24 2.8.04.14.06.28.06.43.03.82-.33 1.72-.93 2.27"/></svg>',
		label: 'Tip'
	},
	warning: {
		icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M13 14h-2V9h2m0 9h-2v-2h2M1 21h22L12 2z"/></svg>',
		label: 'Warning'
	},
	danger: {
		icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
		label: 'Danger'
	},
	important: {
		icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M13 14h-2V9h2m0 9h-2v-2h2M1 21h22L12 2z"/></svg>',
		label: 'Important'
	},
	info: {
		icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M13 9h-2V7h2m0 10h-2v-6h2m-1-9A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2"/></svg>',
		label: 'Info'
	},
	success: {
		icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M21 7 9 19l-5.5-5.5 1.41-1.41L9 16.17 19.59 5.59z"/></svg>',
		label: 'Success'
	},
	example: {
		icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M7 2v2h1v14a4 4 0 0 0 4 4 4 4 0 0 0 4-4V4h1V2zm4 14c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1m2-4c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1m1-5h-4V4h4z"/></svg>',
		label: 'Example'
	},
	abstract: {
		icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M17 9H7V7h10m0 6H7v-2h10m-3 6H7v-2h7M12 3a1 1 0 0 1 1 1 1 1 0 0 1-1 1 1 1 0 0 1-1-1 1 1 0 0 1 1-1m7 0h-4.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2"/></svg>',
		label: 'Abstract'
	},
	question: {
		icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="m15.07 11.25-.9.92C13.45 12.89 13 13.5 13 15h-2v-.5c0-1.11.45-2.11 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41a2 2 0 0 0-2-2 2 2 0 0 0-2 2H8a4 4 0 0 1 4-4 4 4 0 0 1 4 4 3.2 3.2 0 0 1-.93 2.25M13 19h-2v-2h2M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10c0-5.53-4.5-10-10-10"/></svg>',
		label: 'Question'
	},
	bug: {
		icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M11 13h2v1h-2zm10-8v6c0 5.5-3.8 10.7-9 12-5.2-1.3-9-6.5-9-12V5l9-4zm-4 5h-2.2c-.2-.6-.6-1.1-1.1-1.5l1.2-1.2-.7-.7L12.8 8H12c-.2 0-.5 0-.7.1L9.9 6.6l-.8.8 1.2 1.2c-.5.3-.9.8-1.1 1.4H7v1h2v1H7v1h2v1H7v1h2.2c.4 1.2 1.5 2 2.8 2s2.4-.8 2.8-2H17v-1h-2v-1h2v-1h-2v-1h2zm-6 2h2v-1h-2z"/></svg>',
		label: 'Bug'
	},
	quote: {
		icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M14 17h3l2-4V7h-6v6h3M6 17h3l2-4V7H5v6h3z"/></svg>',
		label: 'Quote'
	}
}

function convertCallouts(html: string): string {
	// Iterative replacement handles nested callouts (inner-to-outer).
	// Each pass matches only the innermost blockquotes whose bodies no
	// longer contain a </blockquote> from a nested callout.
	let prev = ''
	let current = html
	while (prev !== current) {
		prev = current
		current = current.replace(
			/<blockquote>\s*<p>\[!(\w+)\]([-+])?[^\S\n]*([\s\S]*?)<\/p>([\s\S]*?)<\/blockquote>/g,
			(match, type: string, collapse: string | undefined, titleContent: string, body: string) => {
				const config = CALLOUT_CONFIG[type.toLowerCase()]
				if (!config) return match

				const typeClass = type.toLowerCase()
				const firstNewline = titleContent.indexOf('\n')
				const actualTitle = firstNewline === -1
					? titleContent.trim()
					: titleContent.substring(0, firstNewline).trim()
				const displayTitle = actualTitle || config.label

				// Move overflow from the first <p> back into the body
				const firstParaRest = firstNewline === -1
					? ''
					: titleContent.substring(firstNewline + 1).trim()
				const fullBody = firstParaRest
					? `<p>${firstParaRest}</p>${body}`
					: body

				if (collapse) {
					const openAttr = collapse === '+' ? ' open' : ''
					return (
						`<details class="callout callout-${typeClass}"${openAttr}>` +
						`<summary class="callout-header">${config.icon}<span>${displayTitle}</span></summary>` +
						`<div class="callout-body">${fullBody}</div>` +
						`</details>`
					)
				}
				return (
					`<div class="callout callout-${typeClass}">` +
					`<div class="callout-header">${config.icon}<span>${displayTitle}</span></div>` +
					`<div class="callout-body">${fullBody}</div>` +
					`</div>`
				)
			}
		)
	}
	return current
}

// Lazy load shiki to handle environments where it's not available (e.g., Cloudflare Workers)
let shikiModule: typeof import('shiki') | null = null
let shikiLoadAttempted = false

async function loadShiki() {
	if (shikiLoadAttempted) {
		return shikiModule
	}
	shikiLoadAttempted = true

	try {
		shikiModule = await import('shiki')
		return shikiModule
	} catch (error) {
		console.warn('Failed to load shiki module:', error)
		return null
	}
}

// Lazy load katex to handle environments where it's not available (e.g., Cloudflare Workers)
let katexModule: typeof import('katex') | null = null
let katexLoadAttempted = false

async function loadKatex() {
	if (katexModule) return katexModule
	if (katexLoadAttempted) return null
	katexLoadAttempted = true

	try {
		// katex is published as CJS; depending on bundler/runtime the dynamic import
		// may return either the exports object directly or as `default`.
		const mod: any = await import('katex')
		katexModule = (mod?.default ?? mod) as any
		return katexModule
	} catch (error) {
		console.warn('Failed to load katex module:', error)
		return null
	}
}

export async function renderMarkdown(markdown: string): Promise<MarkdownRenderResult> {
	// Load optional renderers first so they apply on the FIRST lex/parse pass.
	// (If we lex before registering extensions, math tokens won't ever be produced on a cold refresh.)
	const codeBlockMap = new Map<string, { html: string; original: string }>()
	const [shiki, katex] = await Promise.all([loadShiki(), loadKatex()])

	// Render HTML with heading ids
	const renderer = new marked.Renderer()

	renderer.heading = (token: Tokens.Heading) => {
		const id = slugify(token.text || '')
		return `<h${token.depth} id="${id}">${token.text}</h${token.depth}>`
	}

	renderer.code = (token: Tokens.Code) => {
		// Check if this code block was pre-processed
		const codeData = codeBlockMap.get(token.text)
		if (codeData) {
			// Add data-code attribute with original code for copy functionality
			// Escape HTML entities for attribute value
			const escapedCode = codeData.original.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
			if (codeData.html) {
				// Shiki highlighted code
				return `<pre data-code="${escapedCode}">${codeData.html}</pre>`
			}
			// Fallback for failed highlighting
			return `<pre data-code="${escapedCode}"><code>${codeData.original}</code></pre>`
		}
		// Fallback to default (inline code, not code block)
		return `<code>${token.text}</code>`
	}

	renderer.listitem = (token: Tokens.ListItem) => {
		// Render inline markdown inside list items (e.g. links, emphasis)
		let inner = token.text
		let tokens = token.tokens

		if (token.task) tokens = tokens.slice(1)
		inner = marked.parser(tokens) as string

		if (token.task) {
			const checkbox = token.checked ? '<input type="checkbox" checked disabled />' : '<input type="checkbox" disabled />'
			return `<li class="task-list-item">${checkbox} ${inner}</li>\n`
		}

		return `<li>${inner}</li>\n`
	}

	const renderMath = (content: string, displayMode: boolean) => {
		if (!katex) {
			// Keep original delimiters if katex is not available
			return displayMode ? `$$${content}$$` : `$${content}$`
		}

		try {
			return katex.renderToString(content, {
				displayMode,
				throwOnError: false,
				output: 'html',
				strict: 'ignore'
			})
		} catch {
			return displayMode ? `$$${content}$$` : `$${content}$`
		}
	}

	// Register extensions BEFORE lexing so math gets tokenized on cold refresh.
	marked.use({
		renderer,
		extensions: [
			// Block math: $$ ... $$
			{
				name: 'mathBlock',
				level: 'block',
				start(src: string) {
					return src.indexOf('$$')
				},
				tokenizer(src: string) {
					const match = src.match(/^\$\$([\s\S]+?)\$\$(?:\n+|$)/)
					if (!match) return
					return {
						type: 'mathBlock',
						raw: match[0],
						text: match[1].trim()
					} as any
				},
				renderer(token: any) {
					return `${renderMath(token.text || '', true)}\n`
				}
			},
			// Inline math: $ ... $
			{
				name: 'mathInline',
				level: 'inline',
				start(src: string) {
					const idx = src.indexOf('$')
					return idx === -1 ? undefined : idx
				},
				tokenizer(src: string) {
					// Avoid $$ (block) and escaped dollars
					if (src.startsWith('$$')) return
					if (src.startsWith('\\$')) return

					const match = src.match(/^\$([^\n$]+?)\$/)
					if (!match) return

					const inner = match[1]
					// Heuristic: require some non-space content
					if (!inner || !inner.trim()) return

					return {
						type: 'mathInline',
						raw: match[0],
						text: inner.trim()
					} as any
				},
				renderer(token: any) {
					return renderMath(token.text || '', false)
				}
			}
		]
	})

	// Pre-process with marked lexer first (after extensions are registered)
	const tokens = marked.lexer(markdown)

	// Extract TOC from parsed tokens (this correctly skips code blocks)
	const toc: TocItem[] = []
	function extractHeadings(tokenList: typeof tokens) {
		for (const token of tokenList) {
			if (token.type === 'heading' && token.depth <= 3) {
				// Use the parsed text (markdown syntax like links/code already stripped)
				const text = token.text
				const id = slugify(text)
				toc.push({ id, text, level: token.depth })
			}
			// Recursively check nested tokens (e.g., in blockquotes, lists)
			if ('tokens' in token && token.tokens) {
				extractHeadings(token.tokens as typeof tokens)
			}
		}
	}
	extractHeadings(tokens)

	// Pre-process code blocks with Shiki
	for (const token of tokens) {
		if (token.type === 'code') {
			const codeToken = token as Tokens.Code
			const originalCode = codeToken.text
			const key = `__SHIKI_CODE_${codeBlockMap.size}__`

			if (shiki) {
				try {
					const html = await shiki.codeToHtml(originalCode, {
						lang: codeToken.lang || 'text',
						theme: 'one-light'
					})
					codeBlockMap.set(key, { html, original: originalCode })
					codeToken.text = key
				} catch {
					// Keep original if highlighting fails
					codeBlockMap.set(key, { html: '', original: originalCode })
					codeToken.text = key
				}
			} else {
				// Fallback when shiki is not available
				codeBlockMap.set(key, { html: '', original: originalCode })
				codeToken.text = key
			}
		}
	}
	const rawHtml = (marked.parser(tokens) as string) || ''
	const html = convertCallouts(rawHtml)

	return { html, toc }
}
