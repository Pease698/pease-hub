// 把各专栏文章的 config.json 汇总成**一个**扁平索引，供前端一次请求拿到全部专栏文章元信息。
//
// 产物：public/blogs/collection-articles.json（需要提交；属于构建产物）
// 触发：pnpm dev / pnpm build / pnpm build:cf 前自动执行，也可手动 `pnpm collections:index`
//
// 成员关系仍以 public/blogs/collections.json 的 articles 数组为准；本脚本只负责：
//   1. 把每篇文章的 config.json 合并进索引
//   2. 做封面回退——专栏文章没有自己的封面时，采用所属专栏的封面
//   3. 按时间倒序排好，前端拿到即可直接用

const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const BLOGS_DIR = path.join(ROOT, 'public', 'blogs')
const COLLECTIONS_FILE = path.join(BLOGS_DIR, 'collections.json')
const OUT_FILE = path.join(BLOGS_DIR, 'collection-articles.json')

function readJson(file, fallback) {
	try {
		return JSON.parse(fs.readFileSync(file, 'utf8'))
	} catch {
		return fallback
	}
}

function parseTime(value) {
	if (!value) return 0
	const time = new Date(value).getTime()
	return Number.isNaN(time) ? 0 : time
}

function main() {
	const collections = readJson(COLLECTIONS_FILE, [])
	if (!Array.isArray(collections)) {
		throw new Error('public/blogs/collections.json 必须是数组')
	}

	const articles = []
	let missing = 0

	for (const collection of collections) {
		if (!collection || typeof collection.slug !== 'string') continue
		const slugs = Array.isArray(collection.articles) ? collection.articles : []

		for (const slug of slugs) {
			if (typeof slug !== 'string' || !slug) continue

			const configPath = path.join(BLOGS_DIR, collection.slug, 'articles', slug, 'config.json')
			const config = readJson(configPath, null)

			if (!config) {
				missing += 1
				console.warn(`[collections-index] 跳过（缺少 config.json）：${collection.slug}/articles/${slug}`)
				continue
			}

			articles.push({
				collection: collection.slug,
				collectionTitle: collection.title || collection.slug,
				slug,
				title: config.title || slug,
				date: config.date,
				tags: Array.isArray(config.tags) ? config.tags.filter(tag => typeof tag === 'string') : [],
				summary: config.summary,
				// 专栏文章没有自己的封面时，回退到所属专栏的封面
				cover: config.cover || collection.cover
			})
		}
	}

	articles.sort((a, b) => parseTime(b.date) - parseTime(a.date))

	fs.writeFileSync(OUT_FILE, `${JSON.stringify(articles, null, '\t')}\n`)
	console.log(`[collections-index] 已生成 ${path.relative(ROOT, OUT_FILE)}：${articles.length} 篇${missing ? `（跳过 ${missing} 篇）` : ''}`)
}

main()
