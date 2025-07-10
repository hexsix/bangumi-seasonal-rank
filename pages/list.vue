<template>
  <div>
    <!-- 页面标题 -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">季度列表</h1>
      <p class="text-gray-600">选择您想查看的动画季度</p>
    </div>

    <!-- 加载状态 -->
    <div v-if="pending" class="flex justify-center items-center min-h-64">
      <div class="text-gray-500">正在加载季度列表...</div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="flex justify-center items-center min-h-64">
      <div class="text-red-500">
        <p>加载季度列表失败</p>
        <button @click="() => refresh()" class="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          重试
        </button>
      </div>
    </div>

    <!-- 季度列表 -->
    <div v-else-if="years.length > 0" class="space-y-8">
      <div v-for="year in years" :key="year" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">{{ year }}年</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <NuxtLink v-for="season in groupedSeasons[year]" :key="season.season_id" :to="`/${season.season_id}`"
            class="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
            <div class="text-lg font-medium text-gray-900">{{ formatSeasonName(season.season_id) }}</div>
            <div class="text-sm text-gray-500 mt-1">{{ season.name }}</div>
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

// 获取季度数据
const { groupedSeasons, years, pending, error, refresh } = useSeasons()

// 设置页面元数据
useHead({
  title: '季度列表 - Bangumi.tv 动画季度排行榜'
})
</script>