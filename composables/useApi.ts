import type { SeasonDetail, AvailableSeasons } from '~/types'
import { getAvailableSeasons, getSeasonDetail, getCurrentSeasonId } from '~/utils/api'

// API调用封装
export const useApi = () => {
  // 获取可用季度列表
  const fetchAvailableSeasons = () => {
    return useFetch<AvailableSeasons>('/api/v0/season/available', {
      baseURL: 'https://api.rinshankaiho.fun',
      key: 'available-seasons',
      default: () => ({ seasons: [] }),
      server: true,
      lazy: false
    })
  }

  // 获取指定季度详情
  const fetchSeasonDetail = (seasonId: string) => {
    return useFetch<SeasonDetail>(`/api/v0/season/${seasonId}`, {
      baseURL: 'https://api.rinshankaiho.fun',
      key: `season-${seasonId}`,
      server: true,
      lazy: false
    })
  }

  // 获取当前季度ID
  const fetchCurrentSeasonId = () => {
    return useFetch<AvailableSeasons>('/api/v0/season/available', {
      baseURL: 'https://api.rinshankaiho.fun',
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