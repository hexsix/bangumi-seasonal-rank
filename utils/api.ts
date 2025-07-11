import type { SeasonDetail, AvailableSeasons, RawAvailableSeasons } from '~/types'

// 缓存配置
const CACHE_DURATION = 30 * 60 * 1000 // 30分钟缓存时间

// 获取API基础URL配置
function getApiBaseUrl(): string {
  const config = useRuntimeConfig()
  return config.public.apiBaseUrl || 'https://api.rinshankaiho.fun'
}

// 检查数据新鲜度
export function isDataFresh(updatedAt: string): boolean {
  const updateTime = new Date(updatedAt).getTime()
  const now = Date.now()
  return (now - updateTime) < CACHE_DURATION
}

// 生成动态缓存键
export function generateCacheKey(baseKey: string): string {
  return `${baseKey}-${Math.floor(Date.now() / CACHE_DURATION)}`
}

// 获取缓存过期时间
export function getCacheExpiryTime(): number {
  return Date.now() + CACHE_DURATION
}

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
    const baseUrl = getApiBaseUrl()
    const response = await $fetch<T>(`${baseUrl}${endpoint}`, {
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
export async function getAvailableSeasons(): Promise<RawAvailableSeasons> {
  return await apiRequest<RawAvailableSeasons>('/api/v0/season/available')
}

// 获取指定季度详情
export async function getSeasonDetail(seasonId: string): Promise<SeasonDetail> {
  return await apiRequest<SeasonDetail>(`/api/v0/season/${seasonId}`)
}

// 获取当前季度ID（最新季度）
export async function getCurrentSeasonId(): Promise<string> {
  const seasons = await getAvailableSeasons()
  if (seasons.available_seasons.length === 0) {
    throw new ApiError('没有可用的季度数据', 404, 'Not Found')
  }
  // 返回最新的季度ID
  return seasons.available_seasons[0].toString()
}

// 导出API基础URL获取函数，供其他模块使用
export { getApiBaseUrl } 