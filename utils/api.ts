import type { SeasonDetail, AvailableSeasons } from '~/types'

// API基础配置
const API_BASE_URL = 'https://api.rinshankaiho.fun'

// 通用API错误处理
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// 通用API请求函数
async function apiRequest<T>(endpoint: string): Promise<T> {
  try {
    const response = await $fetch<T>(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      retry: 3,
      retryDelay: 1000,
    })
    return response
  } catch (error: any) {
    if (error.status) {
      throw new ApiError(
        `API请求失败: ${error.statusText}`,
        error.status,
        error.statusText
      )
    }
    throw new ApiError(
      '网络连接错误',
      0,
      'Network Error'
    )
  }
}

// 获取可用季度列表
export async function getAvailableSeasons(): Promise<AvailableSeasons> {
  return await apiRequest<AvailableSeasons>('/api/v0/season/available')
}

// 获取指定季度详情
export async function getSeasonDetail(seasonId: string): Promise<SeasonDetail> {
  return await apiRequest<SeasonDetail>(`/api/v0/season/${seasonId}`)
}

// 获取当前季度ID（最新季度）
export async function getCurrentSeasonId(): Promise<string> {
  const seasons = await getAvailableSeasons()
  if (seasons.seasons.length === 0) {
    throw new ApiError('没有可用的季度数据', 404, 'Not Found')
  }
  // 返回最新的季度ID
  return seasons.seasons[0].season_id
} 