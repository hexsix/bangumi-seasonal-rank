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
              <label class="flex items-center cursor-pointer select-none text-xs sm:text-sm text-gray-700">
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
                  sortField === option.field 
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-blue-50'
                ]"
                style="border: none;"
              >
                {{ option.label }} 
                <span v-if="sortField === option.field" class="ml-1">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading/Error States -->
      <div v-if="pending" class="flex justify-center items-center min-h-64">
        <div class="text-gray-500">正在加载动画数据...</div>
      </div>
      <div v-else-if="error" class="flex justify-center items-center min-h-64">
        <div class="text-red-500">
          <p>加载动画数据失败</p>
          <button @click="() => refresh()" class="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            重试
          </button>
        </div>
      </div>

      <!-- Anime List -->
      <div v-else-if="sortedAnimeList.length > 0" class="anime-list">
        <AnimeListItem v-for="(anime, index) in sortedAnimeList" :key="anime.id" :anime="anime" :index="index" @show-image="showLargeImage" />
      </div>

      <!-- Empty State -->
      <div v-else class="flex justify-center items-center min-h-64">
        <div class="text-gray-500">该季度暂无动画数据</div>
      </div>
    </div>

    <!-- 数据更新时间移至底部 Footer 上方 -->
    <div v-if="lastUpdateTime" class="text-xs sm:text-sm text-gray-600 flex items-center justify-center mt-8 mb-2">
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

// 使用新的变量名以匹配模板
const defaultSortDirections: Record<string, 'asc' | 'desc'> = {
  rank: 'asc',
  score: 'desc',
  collection_total: 'desc',
  average_comment: 'desc',
  drop_rate: 'desc'
}

const sortField = ref<SortOption>(sortBy.value)
const sortOrder = ref<'asc' | 'desc'>(sortDirection.value)

const filteredAnimeList = computed(() => {
  if (showOnlyRanked.value) {
    return animeList.value.filter(anime => anime.rank > 0)
  }
  return animeList.value
})

const sortedAnimeList = computed(() => {
  const list = filteredAnimeList.value.slice()
  const field = sortField.value
  const order = sortOrder.value
  return list.sort((a, b) => {
    if (a[field] === b[field]) return 0
    if (order === 'asc') return a[field] - b[field]
    return b[field] - a[field]
  })
})

const lastUpdateTime = computed(() => {
  return seasonData.value?.updated_at || null
})

const sortOptions = [
  { field: 'rank', label: 'Rank' },
  { field: 'score', label: '评分' },
  { field: 'collection_total', label: '收藏' },
  { field: 'average_comment', label: '评论' },
  { field: 'drop_rate', label: '抛弃率' }
]

const handleSort = (field: string) => {
  if (sortField.value === field) {
    // 切换当前字段方向
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    // 切换字段时采用该字段默认方向
    sortField.value = field
    sortOrder.value = defaultSortDirections[field] || 'desc'
  }
  toggleSort(field as SortOption)
}

const showLargeImage = (url: string, alt: string) => {
  largeImageUrl.value = url
  largeImageAlt.value = alt
  largeImageShow.value = true
}

useHead({
  title: `${formatSeasonName(seasonId)} - Bangumi.tv 动画季度排行榜`
})
</script>

<style scoped>
.anime-list > div {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.anime-list > div:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
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