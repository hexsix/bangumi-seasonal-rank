<template>
  <div>
    <!-- 页面标题 -->
    <div class="mb-4">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">季度列表</h1>
    </div>

    <!-- 加载状态 -->
    <div v-if="pending" class="flex justify-center items-center min-h-64">
      <div class="text-gray-500">正在加载季度列表...</div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="flex justify-center items-center min-h-64">
      <div class="text-red-500">
        <p>加载季度列表失败</p>
        <button class="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" @click="() => refresh()">
          重试
        </button>
      </div>
    </div>

    <!-- 季度列表 -->
    <div v-else-if="years.length > 0" class="space-y-4">
      <div v-for="year in years" :key="year" class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h2 class="text-2xl font-bold text-gray-800 mb-3">
          {{ year }}
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <NuxtLink
            v-for="season in groupedSeasons[year]"
            :key="season.season_id"
            :to="`/${season.season_id}`"
            class="group block rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300 no-underline"
          >
            <div class="w-full h-40 overflow-hidden">
              <img
                :src="seasonImages[season.season_id]"
                :alt="formatSeasonName(season.season_id)"
                class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              >
            </div>
            <div class="p-3">
              <div class="text-lg font-medium text-gray-900">{{ formatSeasonName(season.season_id) }}</div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="flex justify-center items-center min-h-64">
      <div class="text-gray-500">暂无季度数据</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatSeasonName } from '~/utils/helpers'
import { seasonImages } from '~/utils/seasonImages'

// 获取季度数据
const { groupedSeasons, years, pending, error, refresh } = useSeasons()

// 设置页面元数据
useHead({
  title: '季度列表 - Bangumi.tv 动画季度排行榜'
})
</script>