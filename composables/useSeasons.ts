import type { Season, AvailableSeasons, RawAvailableSeasons } from '~/types'
import { groupSeasonsByYear, convertSeasonIdsToSeasons } from '~/utils/helpers'
import { getApiBaseUrl, generateErrorAwareCacheKey, isErrorResponse, getRetryDelay } from '~/utils/api'

// 缓存配置
const CACHE_DURATION = 30 * 60 * 1000 // 30分钟缓存时间

// 季度数据获取逻辑
export const useSeasons = () => {
  // 共享的时间戳，由插件注入
  const renderingTimestamp = useState<number>('renderingTimestamp')
  
  // 重试状态管理
  const retryAttempt = ref(0)
  const isRetrying = ref(false)
  const lastError = ref<any>(null)
  
  // 生成错误感知的缓存键
  const cacheKey = computed(() => {
    const isError = !!lastError.value
    return generateErrorAwareCacheKey('available-seasons', {
      isError,
      retryAttempt: retryAttempt.value,
      useTimeWindow: true,
      timestamp: renderingTimestamp.value
    })
  })
  
  // 获取可用季度列表，使用错误感知缓存键
  const { data: rawSeasonsData, pending, error, refresh } = useFetch<RawAvailableSeasons>('/api/v0/season/available', {
    baseURL: getApiBaseUrl(),
    key: cacheKey,
    default: () => ({ current_season_id: 0, available_seasons: [] }),
    server: true,
    lazy: false,
    // 错误处理
    onResponseError: (err) => {
      lastError.value = err
      console.error('季度API请求错误:', err)
    },
    onResponse: (response) => {
      // 检查响应是否为错误
      if (isErrorResponse(response.response._data)) {
        lastError.value = response.response._data
        console.error('季度API返回错误响应:', response.response._data)
      } else {
        // 成功响应，清除错误状态
        lastError.value = null
        retryAttempt.value = 0
      }
    }
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
      console.error('季度数据重试失败:', retryError)
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

  return {
    seasons: seasonsData,
    groupedSeasons,
    currentSeason,
    years,
    pending,
    error,
    refresh,
    forceRefresh,
    // 新增的错误处理相关
    isErrorState,
    isRetrying: readonly(isRetrying),
    retryAttempt: readonly(retryAttempt),
    smartRetry,
    lastError: readonly(lastError)
  }
} 