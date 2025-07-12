import type { Season, Anime, SortOption, SortDirection } from '~/types'

// 将季度ID数组转换为Season对象数组
export function convertSeasonIdsToSeasons(seasonIds: number[]): Season[] {
  return seasonIds.map(seasonId => {
    const { year, month } = parseSeasonIdToYearMonth(seasonId)
    return {
      season_id: seasonId.toString(),
      name: generateSeasonName(seasonId),
      year,
      month
    }
  })
}

// 根据数字ID生成季度名称
export function generateSeasonName(seasonId: number): string {
  const year = Math.floor(seasonId / 100)
  const month = seasonId % 100
  return `${year}年${month}月`
}

// 从数字季度ID解析年份和月份
export function parseSeasonIdToYearMonth(seasonId: number): { year: number; month: number } {
  const year = Math.floor(seasonId / 100)
  const month = seasonId % 100
  return { year, month }
}

// 格式化季度名称
export function formatSeasonName(seasonId: string): string {
  const year = seasonId.slice(0, 4)
  const month = parseInt(seasonId.slice(4, 6))
  return `${year}年${month}月`
}

// 从季度ID解析年份和月份（支持字符串和数字ID）
export function parseSeasonId(seasonId: string | number): { year: number; month: number } {
  if (typeof seasonId === 'number') {
    return parseSeasonIdToYearMonth(seasonId)
  }
  const year = parseInt(seasonId.slice(0, 4))
  const month = parseInt(seasonId.slice(4, 6))
  return { year, month }
}

// 按年份分组季度
export function groupSeasonsByYear(seasons: Season[]): Record<number, Season[]> {
  return seasons.reduce((groups, season) => {
    const year = season.year
    if (!groups[year]) {
      groups[year] = []
    }
    groups[year].push(season)
    return groups
  }, {} as Record<number, Season[]>)
}

// 排序动画列表
export function sortAnimeList(
  animeList: Anime[],
  sortBy: SortOption = 'rank',
  direction: SortDirection = 'asc'
): Anime[] {
  return [...animeList].sort((a, b) => {
    let aValue: number
    let bValue: number

    switch (sortBy) {
      case 'rank':
        // 将 rank 为 0 的视为无穷大，以便在升序中排在最后
        aValue = a.rank === 0 ? Infinity : a.rank
        bValue = b.rank === 0 ? Infinity : b.rank
        break
      case 'score':
        aValue = a.score
        bValue = b.score
        break
      case 'collection_total':
        aValue = a.collection_total
        bValue = b.collection_total
        break
      case 'average_comment':
        aValue = a.average_comment
        bValue = b.average_comment
        break
      case 'drop_rate':
        aValue = a.drop_rate
        bValue = b.drop_rate
        break
      default:
        aValue = a.rank
        bValue = b.rank
    }

    if (direction === 'asc') {
      return aValue - bValue
    } else {
      return bValue - aValue
    }
  })
}

// 格式化数字显示
export function formatNumber(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}

// 格式化评分显示
export function formatScore(score: number): string {
  return score.toFixed(1)
}

// 格式化抛弃率显示
export function formatDropRate(dropRate: number): string {
  return (dropRate * 100).toFixed(1) + '%'
}

// 格式化日期时间显示
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
} 