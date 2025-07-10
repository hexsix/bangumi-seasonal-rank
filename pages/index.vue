<template>
  <div>
    <!-- 加载状态 -->
    <div v-if="pending" class="flex justify-center items-center min-h-64">
      <div class="text-gray-500">正在获取最新季度信息...</div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="flex justify-center items-center min-h-64">
      <div class="text-red-500">
        <p>获取季度信息失败</p>
        <button @click="() => refresh()" class="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          重试
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AvailableSeasons } from '~/types'

// 获取当前季度ID
const { data: currentSeasonId, pending, error, refresh } = useFetch<AvailableSeasons>('https://api.rinshankaiho.fun/api/v0/season/available', {
  key: 'current-season-id',
  server: true,
  lazy: false
})

// 监听当前季度ID变化，进行重定向
watch(currentSeasonId, (newData) => {
  if (newData?.seasons && newData.seasons.length > 0) {
    navigateTo(`/${newData.seasons[0].season_id}`)
  }
}, { immediate: true })

// 设置页面元数据
useHead({
  title: 'Bangumi.tv 动画季度排行榜 - 首页'
})
</script>