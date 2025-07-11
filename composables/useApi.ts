import type { SeasonDetail, AvailableSeasons, RawAvailableSeasons } from '~/types'
import { getAvailableSeasons, getSeasonDetail, getCurrentSeasonId, getApiBaseUrl } from '~/utils/api'

// 缓存配置
const CACHE_DURATION = 30 * 60 * 1000 // 30分钟缓存时间

// API调用封装
export const useApi = () => {
  // 生成动态缓存键
  const getCacheKey = (baseKey: string) => {
    return `${baseKey}-${Math.floor(Date.now() / CACHE_DURATION)}`
  }

  // 获取可用季度列表
  const fetchAvailableSeasons = () => {
    return useFetch<RawAvailableSeasons>('/api/v0/season/available', {
      baseURL: getApiBaseUrl(),
      key: getCacheKey('available-seasons'),
      default: () => ({ current_season_id: 0, available_seasons: [] }),
      server: true,
      lazy: false
    })
  }

  // 获取指定季度详情
  const fetchSeasonDetail = (seasonId: string) => {
    return useFetch<SeasonDetail>(`/api/v0/season/${seasonId}`, {
      baseURL: getApiBaseUrl(),
      key: getCacheKey(`season-${seasonId}`),
      server: true,
      lazy: false,
      default: () => ({
        season_id: seasonId,
        updated_at: new Date().toISOString(),
        subjects: []
      } as SeasonDetail)
    })
  }

  // 获取当前季度ID
  const fetchCurrentSeasonId = () => {
    return useFetch<AvailableSeasons>('/api/v0/season/available', {
      baseURL: getApiBaseUrl(),
      key: getCacheKey('current-season-id'),
      server: true,
      lazy: false,
      default: () => ({ seasons: [], current_season_id: 0 })
    })
  }

  return {
    fetchAvailableSeasons,
    fetchSeasonDetail,
    fetchCurrentSeasonId,
    getCacheKey
  }
} 