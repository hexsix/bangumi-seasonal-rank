import type { Season, AvailableSeasons } from '~/types'
import { groupSeasonsByYear } from '~/utils/helpers'
import { getApiBaseUrl } from '~/utils/api'

// 季度数据获取逻辑
export const useSeasons = () => {
  // 获取可用季度列表
  const { data: seasonsData, pending, error, refresh } = useFetch<AvailableSeasons>('/api/v0/season/available', {
    baseURL: getApiBaseUrl(),
    key: 'available-seasons',
    default: () => ({ seasons: [] }),
    server: true,
    lazy: false
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

  return {
    seasons: seasonsData,
    groupedSeasons,
    currentSeason,
    years,
    pending,
    error,
    refresh
  }
} 