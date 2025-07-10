import type { SeasonDetail, AvailableSeasons, RawAvailableSeasons } from '~/types'
import { getAvailableSeasons, getSeasonDetail, getCurrentSeasonId, getApiBaseUrl } from '~/utils/api'

// API调用封装
export const useApi = () => {
  // 获取可用季度列表
  const fetchAvailableSeasons = () => {
    return useFetch<RawAvailableSeasons>('/api/v0/season/available', {
      baseURL: getApiBaseUrl(),
      key: 'available-seasons',
      default: () => ({ current_season_id: 0, available_seasons: [] }),
      server: true,
      lazy: false
    })
  }

  // 获取指定季度详情
  const fetchSeasonDetail = (seasonId: string) => {
    return useFetch<SeasonDetail>(`/api/v0/season/${seasonId}`, {
      baseURL: getApiBaseUrl(),
      key: `season-${seasonId}`,
      server: true,
      lazy: false
    })
  }

  // 获取当前季度ID
  const fetchCurrentSeasonId = () => {
    return useFetch<AvailableSeasons>('/api/v0/season/available', {
      baseURL: getApiBaseUrl(),
      key: 'current-season-id',
      server: true,
      lazy: false
    })
  }

  return {
    fetchAvailableSeasons,
    fetchSeasonDetail,
    fetchCurrentSeasonId
  }
} 