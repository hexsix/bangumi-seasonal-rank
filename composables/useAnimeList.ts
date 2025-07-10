import type { Anime, SortOption, SortDirection, SeasonDetail } from '~/types'
import { sortAnimeList } from '~/utils/helpers'

// 动画列表数据获取逻辑
export const useAnimeList = (seasonId: string) => {
  // 获取季度详情
  const { data: seasonData, pending, error, refresh } = useFetch<SeasonDetail>(`https://api.rinshankaiho.fun/api/v0/season/${seasonId}`, {
    key: `season-${seasonId}`,
    server: true,
    lazy: false
  })

  // 排序状态
  const sortBy = ref<SortOption>('rank')
  const sortDirection = ref<SortDirection>('asc')

  // 排序后的动画列表
  const sortedAnimeList = computed(() => {
    if (!seasonData.value?.subjects) return []
    return sortAnimeList(seasonData.value.subjects, sortBy.value, sortDirection.value)
  })

  // 切换排序
  const toggleSort = (newSortBy: SortOption) => {
    if (sortBy.value === newSortBy) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortBy.value = newSortBy
      sortDirection.value = 'asc'
    }
  }

  return {
    seasonData,
    animeList: sortedAnimeList,
    sortBy: readonly(sortBy),
    sortDirection: readonly(sortDirection),
    toggleSort,
    pending,
    error,
    refresh
  }
} 