import type { SeasonDetail, AvailableSeasons, RawAvailableSeasons, ErrorInfo, CacheKeyInfo } from '~/types'

// 缓存配置
const CACHE_DURATION = 30 * 60 * 1000 // 30分钟缓存时间
const ERROR_CACHE_DURATION = 5 * 60 * 1000 // 错误响应缓存5分钟

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

// 检查是否为错误响应
export function isErrorResponse(response: any): boolean {
  if (!response) return true
  
  // 检查HTTP状态码
  if (response.status && (response.status >= 400)) {
    return true
  }
  
  // 检查响应数据结构
  if (response.error || response.message?.includes('error')) {
    return true
  }
  
  // 检查空数据或无效数据
  if (!response || (Array.isArray(response) && response.length === 0)) {
    return true
  }
  
  return false
}

// 生成错误感知的缓存键
export function generateErrorAwareCacheKey(baseKey: string, isError: boolean = false, retryAttempt: number = 0): string {
  const errorSuffix = isError ? '-error' : '-success'
  const retrySuffix = retryAttempt > 0 ? `-retry-${retryAttempt}` : ''
  
  return `${baseKey}${errorSuffix}${retrySuffix}`
}

// 获取缓存过期时间
export function getCacheExpiryTime(isError: boolean = false): number {
  const duration = isError ? ERROR_CACHE_DURATION : CACHE_DURATION
  return Date.now() + duration
}

// 判断错误是否可重试
export function shouldRetry(error: ApiError): boolean {
  // 网络错误可以重试
  if (error.status === 0) return true
  
  // 5xx服务器错误可以重试
  if (error.status >= 500) return true
  
  // 4xx客户端错误不重试（除了429 Too Many Requests）
  if (error.status === 429) return true
  
  return false
}

// 获取重试延迟时间（指数退避）
export function getRetryDelay(attempt: number): number {
  return Math.min(1000 * Math.pow(2, attempt), 8000) // 最大8秒
}

// 生成动态缓存键（保持向后兼容）
export function generateCacheKey(baseKey: string): string {
  return generateErrorAwareCacheKey(baseKey, false)
}

// 通用API错误处理
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public type: 'network' | 'api' | 'cors' | 'unknown' = 'unknown',
    public retryable: boolean = false
  ) {
    super(message)
    this.name = 'ApiError'
    this.retryable = retryable || shouldRetry(this)
  }
}

// 通用API请求函数
async function apiRequest<T>(endpoint: string, retryAttempt: number = 0): Promise<T> {
  try {
    const baseUrl = getApiBaseUrl()
    const response = await $fetch<T>(`${baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      retry: 0, // 禁用内置重试，使用自定义重试逻辑
      retryDelay: 1000,
    })
    
    // 检查响应是否为错误
    if (isErrorResponse(response)) {
      throw new ApiError(
        'API返回错误响应',
        400,
        'Bad Response',
        'api',
        false
      )
    }
    
    return response
  } catch (error: any) {
    // 处理CORS错误
    if (error.message?.includes('CORS') || error.message?.includes('cross-origin')) {
      throw new ApiError(
        '跨域请求被阻止',
        0,
        'CORS Error',
        'cors',
        false
      )
    }
    
    // 处理网络错误
    if (error.status === 0 || error.message?.includes('network')) {
      throw new ApiError(
        '网络连接错误',
        0,
        'Network Error',
        'network',
        true
      )
    }
    
    // 处理HTTP错误
    if (error.status) {
      throw new ApiError(
        `API请求失败: ${error.statusText}`,
        error.status,
        error.statusText,
        'api',
        shouldRetry({ status: error.status, statusText: error.statusText } as ApiError)
      )
    }
    
    // 处理其他错误
    throw new ApiError(
      '未知错误',
      0,
      'Unknown Error',
      'unknown',
      false
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
    throw new ApiError('没有可用的季度数据', 404, 'Not Found', 'api', false)
  }
  // 返回最新的季度ID
  return seasons.available_seasons[0].toString()
}

// 导出API基础URL获取函数，供其他模块使用
export { getApiBaseUrl } 