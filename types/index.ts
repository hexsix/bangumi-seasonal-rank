// API响应类型定义
export interface ApiResponse<T> {
  data: T
  error?: string
}

// 原始API响应类型
export interface RawAvailableSeasons {
  current_season_id: number
  available_seasons: number[]
}

// 季度信息类型
export interface Season {
  season_id: string
  name: string
  year: number
  month: number
}

// 动画信息类型
export interface Anime {
  id: number
  name: string
  name_cn: string
  images_grid: string
  images_large: string
  rank: number
  score: number
  collection_total: number
  average_comment: number
  drop_rate: number
  air_weekday: string | null
  meta_tags: string[]
  updated_at: string
}

// 季度详情响应类型
export interface SeasonDetail {
  season_id: string
  updated_at: string
  subjects: Anime[]
}

// 转换后的可用季度列表响应类型
export interface AvailableSeasons {
  seasons: Season[]
  current_season_id: number
}

// 排序选项类型
export type SortOption = 'rank' | 'score' | 'collection_total' | 'average_comment' | 'drop_rate'

// 排序方向类型
export type SortDirection = 'asc' | 'desc' 