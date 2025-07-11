import type { Anime, SortOption, SortDirection, SeasonDetail } from '~/types'
import { sortAnimeList } from '~/utils/helpers'
import { getApiBaseUrl } from '~/utils/api'

// 缓存配置
const CACHE_DURATION = 30 * 60 * 1000 // 30分钟缓存时间

// 动画列表数据获取逻辑
export const useAnimeList = (seasonId: string) => {
  // 生成带时间戳的缓存键，确保缓存能够及时更新
  const cacheKey = computed(() => `season-${seasonId}-${Math.floor(Date.now() / CACHE_DURATION)}`)
  
  // 获取季度详情，使用动态缓存键
  const { data: seasonData, pending, error, refresh } = useFetch<SeasonDetail>(`/api/v0/season/${seasonId}`, {
    baseURL: getApiBaseUrl(),
    key: cacheKey,
    server: true,
    lazy: false,
    // 设置默认值
    default: () => ({
      season_id: seasonId,
      updated_at: new Date().toISOString(),
      subjects: []
    } as SeasonDetail)
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

  // 检查数据新鲜度
  const isDataFresh = computed(() => {
    if (!seasonData.value?.updated_at) return false
    const updateTime = new Date(seasonData.value.updated_at).getTime()
    const now = Date.now()
    return (now - updateTime) < CACHE_DURATION
  })

  // 强制刷新数据
  const forceRefresh = async () => {
    await refresh()
  }

  // 自动刷新机制（每5分钟检查一次）
  const autoRefreshTimer = ref<NodeJS.Timeout | null>(null)
  
  onMounted(() => {
    autoRefreshTimer.value = setInterval(async () => {
      if (!isDataFresh.value) {
        await refresh()
      }
    }, 5 * 60 * 1000) // 5分钟
  })

  onUnmounted(() => {
    if (autoRefreshTimer.value) {
      clearInterval(autoRefreshTimer.value)
    }
  })

  return {
    seasonData,
    animeList: sortedAnimeList,
    sortBy: readonly(sortBy),
    sortDirection: readonly(sortDirection),
    toggleSort,
    pending,
    error,
    refresh,
    isDataFresh,
    forceRefresh
  }
} 