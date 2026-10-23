export type MusicTrack = {
	id: string
	title: string
	artist?: string
	src: string
	cover?: string
}

/**
 * 曲目唯一数据源。
 * 新增音乐时把文件放到 public/music/ 下，并在此追加一条记录即可。
 * 注意：当前音频文件没有 ID3 title/artist 标签，歌名以这里配置的为准。
 */
export const MUSIC_TRACKS: MusicTrack[] = [
	{
		id: 'close-to-you',
		title: 'Close To You',
		artist: 'Carpenters',
		src: '/music/close-to-you.mp3'
	},
	{
		id: 'christmas',
		title: 'Christmas',
		src: '/music/christmas.mp3'
	},
	{
		id: 'Merry-Christmas-Mr_Lawrence',
		title: 'Merry Christmas Mr.Lawrence',
		artist: '坂本龙一 / Jaques Morelenbaum / Judy Kang',
		src: '/music/Merry-Christmas-Mr_Lawrence.mp3'
	}
]
