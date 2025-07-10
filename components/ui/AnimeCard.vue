<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
    <!-- 动画海报 -->
    <div class="aspect-[3/4] bg-gray-200 overflow-hidden">
      <img
:src="anime.images_grid" :alt="anime.name_cn || anime.name" class="w-full h-full object-cover"
        loading="lazy" >
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
        <span
v-for="tag in anime.meta_tags.slice(0, 3)" :key="tag"
          class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
          {{ tag }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatScore, formatNumber } from '~/utils/helpers'

defineProps({
  anime: {
    type: Object,
    required: true
  }
})
</script>