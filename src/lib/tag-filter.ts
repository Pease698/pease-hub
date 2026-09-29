/**
 * 标签检索的通用逻辑。
 *
 * 专栏搜索与普通文章搜索共用同一套算法，但**数据源与路由各自独立**：
 * 这里只提供纯函数，调用方自己决定"搜哪份数据"。
 */

export type Taggable = {
	title: string
	tags: string[]
}

/** 标签汇总项：标签名 + 在给定条件下的命中数 */
export type TagOption = {
	tag: string
	count: number
}

/** 汇总标签（去重 + 计数），按数量倒序、同数量按字典序 */
export function collectTags<T extends Taggable>(items: T[]): TagOption[] {
	const counter = new Map<string, number>()
	for (const item of items) {
		for (const tag of item.tags) {
			counter.set(tag, (counter.get(tag) ?? 0) + 1)
		}
	}

	return Array.from(counter, ([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
}

/**
 * 检索：
 *   - 关键词为空 → 不按标题筛选（trim 后比较，忽略大小写）
 *   - 未选标签 → 不按标签筛选
 *   - 选了多个标签 → 需**同时包含**（AND）
 * 两个条件同时生效。
 */
export function filterByKeywordAndTags<T extends Taggable>(items: T[], keyword: string, selectedTags: Set<string>): T[] {
	const query = keyword.trim().toLowerCase()
	if (!query && selectedTags.size === 0) return items

	return items.filter(item => {
		if (query && !item.title.toLowerCase().includes(query)) return false
		for (const tag of selectedTags) {
			if (!item.tags.includes(tag)) return false
		}
		return true
	})
}

/**
 * 计算各标签在当前条件下的候选命中数（关键词 + 已选标签 + 该标签），
 * 用于在 chip 上显示数量、并把"加了就会归零"的标签置灰。
 * 顺序沿用全局热度排序，避免选择时位置跳动。
 */
export function collectTagOptions<T extends Taggable>(items: T[], keyword: string, selectedTags: Set<string>): TagOption[] {
	return collectTags(items).map(({ tag }) => {
		const candidate = new Set(selectedTags)
		candidate.add(tag)
		return { tag, count: filterByKeywordAndTags(items, keyword, candidate).length }
	})
}
