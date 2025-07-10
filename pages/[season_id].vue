<template>
  <div>
    <!-- 页面标题 -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ formatSeasonName(seasonId) }}</h1>
      <p class="text-gray-600">动画季度排行榜</p>
    </div>

    <!-- 加载状态 -->
    <div v-if="pending" class="flex justify-center items-center min-h-64">
      <div class="text-gray-500">正在加载动画数据...</div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="flex justify-center items-center min-h-64">
      <div class="text-red-500">
        <p>加载动画数据失败</p>
        <button @click="() => refresh()" class="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          重试
        </button>
      </div>
    </div>

    <!-- 动画列表 -->
    <div v-else-if="animeList.length > 0">
      <!-- 排序控制 -->
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

      <!-- 动画网格 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="anime in animeList" :key="anime.id"
          class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
          <!-- 动画海报 -->
          <div class="aspect-[3/4] bg-gray-200 overflow-hidden">
            <img :src="anime.images_grid" :alt="anime.name_cn || anime.name" class="w-full h-full object-cover"
              loading="lazy" />
          </div>

          <!-- 动画信息 -->
          <div class="p-4">
            <!-- 排名 -->
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-500">排名</span>
              <span class="text-lg font-bold text-blue-600">#{{ anime.rank }}</span>
            </div>

            <!-- 标题 -->
            <h3 class="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
              {{ anime.name_cn || anime.name }}
            </h3>
            <p v-if="anime.name_cn && anime.name !== anime.name_cn" class="text-sm text-gray-500 mb-3 line-clamp-1">
              {{ anime.name }}
            </p>

            <!-- 评分 -->
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-gray-500">评分</span>
              <span class="text-lg font-bold text-yellow-600">{{ formatScore(anime.score) }}</span>
            </div>

            <!-- 收藏数 -->
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-gray-500">收藏</span>
              <span class="text-sm font-medium text-gray-700">{{ formatNumber(anime.collection_total) }}</span>
            </div>

            <!-- 标签 -->
            <div class="flex flex-wrap gap-1 mt-3">
              <span v-for="tag in anime.meta_tags.slice(0, 3)" :key="tag"
                class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="flex justify-center items-center min-h-64">
      <div class="text-gray-500">该季度暂无动画数据</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatSeasonName, formatScore, formatNumber } from '~/utils/helpers'

// 获取路由参数
const route = useRoute()
const seasonId = route.params.season_id as string

// 获取动画数据
const { animeList, sortBy, sortDirection, toggleSort, pending, error, refresh } = useAnimeList(seasonId)

// 排序选项
const sortOptions = [
  { label: '排名', value: 'rank' },
  { label: '评分', value: 'score' },
  { label: '收藏', value: 'collection_total' },
  { label: '评论', value: 'average_comment' },
  { label: '抛弃率', value: 'drop_rate' }
]

// 设置页面元数据
useHead({
  title: `${formatSeasonName(seasonId)} - Bangumi.tv 动画季度排行榜`
})
</script>