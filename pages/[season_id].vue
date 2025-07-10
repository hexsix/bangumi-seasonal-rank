<template>
  <div>
    <!-- Sub-header -->
    <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div class="text-sm text-gray-500">
        数据更新时间: {{ lastUpdated }}
      </div>
      <div class="flex items-center space-x-2">
        <label for="show-ranked-only" class="text-sm font-medium text-gray-700">仅显示有排名的作品</label>
        <div
          :class="[showRankedOnly ? 'bg-blue-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2']"
          @click="showRankedOnly = !showRankedOnly"
        >
          <span
            :class="[showRankedOnly ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']"
          />
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
    <div v-else-if="filteredAnimeList.length > 0" class="space-y-4">
      <!-- Sort Controls -->
      <div class="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex flex-wrap gap-2">
          <button v-for="sortOption in sortOptions" :key="sortOption.value" @click="toggleSort(sortOption.value)"
            :class="[
              'px-3 py-1 rounded text-sm font-medium transition-colors',
              sortBy === sortOption.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]">
            {{ sortOption.label }}
            <span v-if="sortBy === sortOption.value" class="ml-1">
              {{ sortDirection === 'asc' ? '↑' : '↓' }}
            </span>
          </button>
        </div>
      </div>
      
      <!-- Anime Items -->
      <AnimeListItem v-for="anime in filteredAnimeList" :key="anime.id" :anime="anime" />
    </div>

    <!-- Empty State -->
    <div v-else class="flex justify-center items-center min-h-64">
      <div class="text-gray-500">该季度暂无动画数据</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AnimeListItem from '~/components/ui/AnimeListItem.vue'
import { formatSeasonName } from '~/utils/helpers'
import type { SortOption } from '~/types'

const route = useRoute()
const seasonId = route.params.season_id as string

const { seasonData, animeList, sortBy, sortDirection, toggleSort, pending, error, refresh } = useAnimeList(seasonId)

const showRankedOnly = ref(true)

const filteredAnimeList = computed(() => {
  if (showRankedOnly.value) {
    return animeList.value.filter(anime => anime.rank > 0)
  }
  return animeList.value
})

const lastUpdated = computed(() => {
  if (seasonData.value?.updated_at) {
    return new Date(seasonData.value.updated_at).toLocaleString('zh-CN')
  }
  return 'N/A'
})

const sortOptions: { label: string, value: SortOption }[] = [
  { label: '排名', value: 'rank' },
  { label: '评分', value: 'score' },
  { label: '收藏', value: 'collection_total' },
  { label: '评论', value: 'average_comment' },
  { label: '抛弃率', value: 'drop_rate' }
]

useHead({
  title: `${formatSeasonName(seasonId)} - Bangumi.tv 动画季度排行榜`
})
</script>