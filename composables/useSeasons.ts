import type { Season, AvailableSeasons, RawAvailableSeasons } from '~/types'
import { groupSeasonsByYear, convertSeasonIdsToSeasons } from '~/utils/helpers'
import { getApiBaseUrl } from '~/utils/api'

// 缓存配置
const CACHE_DURATION = 30 * 60 * 1000 // 30分钟缓存时间

// 季度数据获取逻辑
export const useSeasons = () => {
  // 生成带时间戳的缓存键，确保缓存能够及时更新
  const cacheKey = computed(() => `available-seasons-${Math.floor(Date.now() / CACHE_DURATION)}`)
  
  // 获取可用季度列表，使用动态缓存键
  const { data: rawSeasonsData, pending, error, refresh } = useFetch<RawAvailableSeasons>('/api/v0/season/available', {
    baseURL: getApiBaseUrl(),
    key: cacheKey,
    default: () => ({ current_season_id: 0, available_seasons: [] }),
    server: true,
    lazy: false
  })

  // 转换后的季度数据
  const seasonsData = computed<AvailableSeasons>(() => {
    if (!rawSeasonsData.value) {
      return { seasons: [], current_season_id: 0 }
    }
    return {
      seasons: convertSeasonIdsToSeasons(rawSeasonsData.value.available_seasons),
      current_season_id: rawSeasonsData.value.current_season_id
    }
  })

  // 按年份分组的季度
  const groupedSeasons = computed(() => {
    if (!seasonsData.value?.seasons) return {}
    return groupSeasonsByYear(seasonsData.value.seasons)
  })

  // 获取当前季度（最新季度）
  const currentSeason = computed(() => {
    if (!seasonsData.value?.seasons) return null
    return seasonsData.value.seasons[0]
  })

  // 获取所有年份（降序）
  const years = computed(() => {
    return Object.keys(groupedSeasons.value)
      .map(Number)
      .sort((a, b) => b - a)
  })

  // 强制刷新数据
  const forceRefresh = async () => {
    await refresh()
  }

  // 自动刷新机制（每10分钟检查一次，季度列表更新频率较低）
  const autoRefreshTimer = ref<NodeJS.Timeout | null>(null)
  
  onMounted(() => {
    autoRefreshTimer.value = setInterval(async () => {
      await refresh()
    }, 10 * 60 * 1000) // 10分钟
  })

  onUnmounted(() => {
    if (autoRefreshTimer.value) {
      clearInterval(autoRefreshTimer.value)
    }
  })

  return {
    seasons: seasonsData,
    groupedSeasons,
    currentSeason,
    years,
    pending,
    error,
    refresh,
    forceRefresh
  }
} 