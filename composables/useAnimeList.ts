import type { Anime, SortOption, SortDirection, SeasonDetail } from '~/types'
import { sortAnimeList } from '~/utils/helpers'
import { getApiBaseUrl, generateErrorAwareCacheKey, isErrorResponse, getRetryDelay } from '~/utils/api'

// 默认排序方向配置
const DEFAULT_SORT_DIRECTIONS: Record<SortOption, SortDirection> = {
  rank: 'asc',
  score: 'desc',
  collection_total: 'desc',
  average_comment: 'desc',
  drop_rate: 'desc'
}

// 缓存配置
const CACHE_DURATION = 30 * 60 * 1000 // 30分钟缓存时间

// 动画列表数据获取逻辑
export const useAnimeList = (seasonId: string) => {
  // 重试状态管理
  const retryAttempt = ref(0)
  const isRetrying = ref(false)
  const lastError = ref<any>(null)
  
  // 生成错误感知的缓存键
  const cacheKey = computed(() => {
    const isError = !!lastError.value
    return generateErrorAwareCacheKey(`season-${seasonId}`, {
      isError,
      retryAttempt: retryAttempt.value,
      useTimeWindow: true
    })
  })
  
  // 获取季度详情，使用错误感知缓存键
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
    } as SeasonDetail),
    // 错误处理
    onResponseError: (err) => {
      lastError.value = err
      console.error('API请求错误:', err)
    },
    onResponse: (response) => {
      // 检查响应是否为错误
      if (isErrorResponse(response.response._data)) {
        lastError.value = response.response._data
        console.error('API返回错误响应:', response.response._data)
      } else {
        // 成功响应，清除错误状态
        lastError.value = null
        retryAttempt.value = 0
      }
    }
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
      sortDirection.value = DEFAULT_SORT_DIRECTIONS[newSortBy]
    }
  }

  // 检查数据新鲜度
  const isDataFresh = computed(() => {
    if (!seasonData.value?.updated_at) return false
    const updateTime = new Date(seasonData.value.updated_at).getTime()
    const now = Date.now()
    return (now - updateTime) < CACHE_DURATION
  })

  // 检查是否为错误状态
  const isErrorState = computed(() => {
    return !!error.value || !!lastError.value
  })

  // 智能重试机制
  const smartRetry = async () => {
    if (isRetrying.value) return
    
    isRetrying.value = true
    retryAttempt.value++
    
    try {
      // 等待重试延迟
      const delay = getRetryDelay(retryAttempt.value - 1)
      await new Promise(resolve => setTimeout(resolve, delay))
      
      // 执行重试
      await refresh()
      
      // 重试成功，重置状态
      lastError.value = null
      retryAttempt.value = 0
    } catch (retryError) {
      console.error('重试失败:', retryError)
      lastError.value = retryError
    } finally {
      isRetrying.value = false
    }
  }

  // 强制刷新数据
  const forceRefresh = async () => {
    lastError.value = null
    retryAttempt.value = 0
    await refresh()
  }

  // 自动刷新机制（每5分钟检查一次）
  const autoRefreshTimer = ref<NodeJS.Timeout | null>(null)
  
  onMounted(() => {
    autoRefreshTimer.value = setInterval(async () => {
      // 只有在没有错误且数据不新鲜时才自动刷新
      if (!isErrorState.value && !isDataFresh.value) {
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
    forceRefresh,
    // 新增的错误处理相关
    isErrorState,
    isRetrying: readonly(isRetrying),
    retryAttempt: readonly(retryAttempt),
    smartRetry,
    lastError: readonly(lastError)
  }
} 