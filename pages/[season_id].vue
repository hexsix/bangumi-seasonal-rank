<template>
  <div>
    <!-- 新增居中容器 -->
    <div class="mx-auto px-2 sm:px-4 max-w-4xl">
      <!-- Sub-header -->
      <div class="mb-6">
        <div class="flex flex-col gap-2 sm:items-end w-full sm:w-auto">
          
          <!-- 排序选项 + 筛选勾选框响应式纵横排 -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-4 mt-2">
            <!-- 筛选勾选框，移动端在上 -->
            <div>
              <label class="flex items-center cursor-pointer select-none text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  v-model="showOnlyRanked"
                  class="accent-blue-500 w-4 h-4 rounded mr-1.5"
                />
                仅显示有排名的作品
              </label>
            </div>
            <!-- 排序按钮组，移动端在下 -->
            <div class="flex gap-1.5 overflow-x-auto no-scrollbar sort-btn-group">
              <!-- no-scrollbar 可选，隐藏横向滚动条 -->
              <button 
                v-for="option in sortOptions" 
                :key="option.field"
                @click="handleSort(option.field)"
                :class="[
                  'px-2.5 py-1 text-xs rounded font-medium transition-colors duration-150 focus:outline-none whitespace-nowrap sort-btn',
                  sortBy === option.field 
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-blue-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                ]"
                style="border: none;"
              >
                {{ option.label }} 
                <span v-if="sortBy === option.field" class="ml-1">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading/Error States -->
      <div v-if="pending" class="flex justify-center items-center min-h-64">
        <div class="text-gray-500 dark:text-gray-400">正在加载动画数据...</div>
      </div>
      <div v-else-if="error" class="flex justify-center items-center min-h-64">
        <div class="text-red-500 dark:text-red-400">
          <p>加载动画数据失败</p>
          <button @click="() => refresh()" class="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            重试
          </button>
        </div>
      </div>

      <!-- Anime List -->
      <div v-else-if="filteredAnimeList.length > 0" class="anime-list">
        <AnimeListItem 
          v-for="(anime, index) in filteredAnimeList" 
          :key="anime.id" 
          :anime="anime" 
          :index="index" 
          :top-three-by-metric="topThreeByMetric"
          @show-image="showLargeImage" 
        />
      </div>

      <!-- Empty State -->
      <div v-else class="flex justify-center items-center min-h-64">
        <div class="text-gray-500 dark:text-gray-400">该季度暂无动画数据</div>
      </div>
    </div>

    <!-- 数据更新时间移至底部 Footer 上方 -->
    <div v-if="lastUpdateTime" class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center mt-8 mb-2">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 sm:h-4 sm:w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      数据更新时间: {{ formatDateTime(lastUpdateTime) }}
    </div>

    <!-- 大图查看模态框 -->
    <div v-if="largeImageShow" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" @click="largeImageShow = false">
      <div class="max-w-3xl max-h-[90vh] relative">
        <img :src="largeImageUrl" :alt="largeImageAlt" class="max-w-full max-h-[90vh] object-contain">
        <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-center">
          {{ largeImageAlt }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AnimeListItem from '~/components/ui/AnimeListItem.vue'
import { formatSeasonName, formatDateTime } from '~/utils/helpers'
import type { SortOption } from '~/types'

const route = useRoute()
const seasonId = route.params.season_id as string

const animeListComposable = useAnimeList(seasonId)
const { seasonData, animeList, sortBy, sortDirection, toggleSort, pending, error, refresh, isDataFresh, forceRefresh } = animeListComposable

const showOnlyRanked = ref(true)
const largeImageShow = ref(false)
const largeImageUrl = ref('')
const largeImageAlt = ref('')

const filteredAnimeList = computed(() => {
  if (showOnlyRanked.value) {
    return animeList.value.filter(anime => anime.rank > 0)
  }
  return animeList.value
})

const lastUpdateTime = computed(() => {
  return seasonData.value?.updated_at || null
})

const sortOptions: { field: SortOption; label: string }[] = [
  { field: 'rank', label: 'Rank' },
  { field: 'score', label: '评分' },
  { field: 'collection_total', label: '收藏' },
  { field: 'average_comment', label: '评论' },
  { field: 'drop_rate', label: '抛弃率' }
]

const handleSort = (field: SortOption) => {
  toggleSort(field)
}

const showLargeImage = (url: string, alt: string) => {
  largeImageUrl.value = url
  largeImageAlt.value = alt
  largeImageShow.value = true
}

// 辅助函数：获取指定指标的前三名ID
const getTopThreeIds = (subjects: any[], metric: string, direction: 'asc' | 'desc') => {
  return [...subjects]
    .sort((a, b) => {
      const aVal = a[metric] as number
      const bVal = b[metric] as number
      return direction === 'asc' ? aVal - bVal : bVal - aVal
    })
    .slice(0, 3)
    .map(anime => anime.id)
}

// 计算各个指标的前三名动画ID
const topThreeByMetric = computed(() => {
  if (!seasonData.value?.subjects) return {
    collection_total: [],
    average_comment: [],
    drop_rate: [],
    score: [],
    rank: []
  }
  
  const subjects = seasonData.value.subjects
  return {
    collection_total: getTopThreeIds(subjects, 'collection_total', 'desc'),
    average_comment: getTopThreeIds(subjects, 'average_comment', 'desc'),
    drop_rate: getTopThreeIds(subjects, 'drop_rate', 'asc'), // 抛弃率越小越好
    score: getTopThreeIds(subjects, 'score', 'desc'),
    rank: getTopThreeIds(subjects, 'rank', 'asc')
  }
})

useHead({
  title: `${formatSeasonName(seasonId)} - Bangumi 新番排行榜`,
  meta: [
    {
      name: 'description',
      content: `查看${formatSeasonName(seasonId)}所有新番动画的Bangumi.tv排行榜。我们根据用户评分、收藏数量和综合排名，为您提供最及时、最全面的新番动画排行数据。`
    }
  ]
})
</script>

<style scoped>
/* Safari滚动优化 - 激进简化版本 */
.anime-list > div {
  /* 移除所有可能误导Safari的属性 */
  /* contain: none; */
  /* will-change: auto; */
  transform: translateZ(0); /* 仅保留GPU合成 */
  /* transition: none; */
}

.anime-list > div:hover {
  /* 最小化hover效果 */
  transform: translateZ(0);
  /* opacity: 1; */
}

/* Safari浏览器中完全禁用所有动画 */
.safari-browser .anime-list > div {
  transition: none !important;
  animation: none !important;
  will-change: auto !important;
  contain: none !important;
  transform: translateZ(0) !important;
}

.safari-browser .anime-list > div:hover {
  /* Safari中完全禁用hover效果 */
  transform: translateZ(0) !important;
  opacity: 1 !important;
}

@media (max-width: 640px) {
  .sort-btn-group {
    gap: 4px !important;
  }
  .sort-btn {
    padding-left: 4px !important;
    padding-right: 4px !important;
    padding-top: 2px !important;
    padding-bottom: 2px !important;
    font-size: 12px !important;
    min-width: 32px;
  }
}
</style>