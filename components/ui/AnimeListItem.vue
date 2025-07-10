<template>
  <div class="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
    <!-- Rank -->
    <div class="text-2xl font-bold text-gray-400 w-12 text-center shrink-0">
      {{ anime.rank || '-' }}
    </div>

    <!-- Image -->
    <div class="w-24 shrink-0">
      <img :src="anime.images_grid" :alt="anime.name_cn || anime.name" class="w-full h-auto object-cover rounded" loading="lazy">
    </div>

    <!-- Main Info -->
    <div class="flex-grow">
      <h3 class="text-lg font-semibold text-blue-600 hover:underline">
        <a :href="anime.subject_url" target="_blank" rel="noopener noreferrer">{{ anime.name_cn || anime.name }}</a>
      </h3>
      <p v-if="anime.name_cn && anime.name !== anime.name_cn" class="text-sm text-gray-500 mb-2">
        {{ anime.name }}
      </p>

      <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-700">
        <span><span class="font-semibold text-yellow-600">{{ anime.score }}</span> / {{ anime.rank }}</span>
        <span>收藏: {{ formatNumber(anime.collection_total) }}</span>
        <span>话均评论: {{ formatNumber(anime.average_comment) }}</span>
        <span>抛弃率: {{ formatDropRate(anime.drop_rate) }}</span>
      </div>

      <div class="flex flex-wrap gap-2 mt-3">
        <span v-for="tag in anime.meta_tags" :key="tag" class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
          {{ tag }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatNumber, formatDropRate } from '~/utils/helpers'
import type { Anime } from '~/types'

defineProps<{
  anime: Anime
}>()
</script> 