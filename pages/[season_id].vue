<template>
  <div>
    <!-- 新增居中容器 -->
    <div class="mx-auto px-2 sm:px-4 max-w-4xl">
      <!-- Sub-header -->
      <div class="mb-6">
        <div class="flex flex-col gap-2 sm:items-end w-full sm:w-auto">
          <!-- 更新时间 -->
          <div v-if="lastUpdateTime" class="text-xs sm:text-sm text-gray-600 flex items-center self-end">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 sm:h-4 sm:w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            数据更新时间: {{ formatDateTime(lastUpdateTime) }}
          </div>

          <!-- 显示选项 -->
          <div class="flex items-center gap-2 mb-2 self-end">
            <span class="text-xs sm:text-sm text-gray-600">仅显示有排名的作品</span>
            <button 
              @click="showOnlyRanked = !showOnlyRanked"
              :class="[
                'relative inline-flex h-6 w-11 items-center shrink-0 cursor-pointer rounded-full transition-all duration-300 ease-in-out focus:outline-none',
                showOnlyRanked ? 'bg-blue-500' : 'bg-gray-200'
              ]"
            >
              <span 
                class="absolute pointer-events-none h-5 w-5 transform rounded-full bg-white shadow-md transition-all duration-200 ease-in-out"
                :style="{
                  transform: showOnlyRanked ? 'translate3d(20px, -50%, 0)' : 'translate3d(2px, -50%, 0)',
                  top: '50%'
                }"
              ></span>
            </button>
          </div>
          
          <!-- 排序选项 -->
          <div class="flex flex-wrap gap-2 justify-end mt-2">
            <button 
              v-for="option in sortOptions" 
              :key="option.field"
              @click="handleSort(option.field)"
              :class="['px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm rounded border', sortField === option.field ? 'bg-blue-500 text-white' : 'bg-gray-100']"
            >
              {{ option.label }} 
              <span v-if="sortField === option.field">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
            </button>
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

const { seasonData, animeList, sortBy, sortDirection, toggleSort, pending, error, refresh } = useAnimeList(seasonId)

const showOnlyRanked = ref(true)
const largeImageShow = ref(false)
const largeImageUrl = ref('')
const largeImageAlt = ref('')

// 使用新的变量名以匹配模板
const sortField = sortBy
const sortOrder = sortDirection

const filteredAnimeList = computed(() => {
  if (showOnlyRanked.value) {
    return animeList.value.filter(anime => anime.rank > 0)
  }
  return animeList.value
})

const sortedAnimeList = computed(() => {
  return filteredAnimeList.value
})

const lastUpdateTime = computed(() => {
  return seasonData.value?.updated_at || null
})

const sortOptions = [
  { field: 'rank', label: 'Rank' },
  { field: 'score', label: '评分' },
  { field: 'collection_total', label: '收藏人数' },
  { field: 'average_comment', label: '话均评论' },
  { field: 'drop_rate', label: '抛弃率' }
]

const handleSort = (field: string) => {
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
</style>