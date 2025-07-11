<template>
  <div class="relative flex flex-col sm:flex-row items-start p-3 mb-3 bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
    <!-- 排名 -->
    <div class="rank-badge absolute top-0 left-0 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
      <div class="w-full h-full flex items-center justify-center font-bold text-sm sm:text-base text-gray-700 bg-gray-100">
        {{ index + 1 }}
      </div>
    </div>
    
    <!-- 图片和基本信息的容器 - 在移动端横向排列 -->
    <div class="flex w-[calc(100%-1.5rem)] sm:w-auto ml-6 sm:ml-8 mb-2 sm:mb-0">
      <!-- 图片 -->
      <div class="flex-shrink-0 mr-3 sm:mr-4" @click="$emit('show-image', anime.images_large, anime.name_cn || anime.name)">
        <img 
          v-if="anime && anime.images_grid" 
          :src="anime.images_grid" 
          :alt="anime.name" 
          class="w-14 sm:w-16 h-20 sm:h-24 object-cover cursor-pointer rounded"
          loading="lazy"
          @error="handleImageError"
        />
        <div v-else class="w-14 sm:w-16 h-20 sm:h-24 flex items-center justify-center bg-gray-100 text-gray-400 rounded">
          <span class="text-xs">暂无图片</span>
        </div>
      </div>
      
      <!-- 标题区域 - 移动端布局 -->
      <div class="flex-1 sm:hidden min-w-0">
        <a :href="`https://bgm.tv/subject/${anime.id}`" target="_blank" 
           class="font-bold text-sm block text-gray-900 hover:text-blue-600 no-underline mobile-title-clamp mobile-title-multiline" 
           :title="anime.name_cn || anime.name">
          {{ anime.name_cn || anime.name }}
        </a>
        <p v-if="anime.name_cn" class="text-xs text-gray-600 truncate mobile-subtitle-tight" :title="anime.name">
          {{ anime.name }}
        </p>
        
        <!-- 评分 - 移动端显示 -->
        <div class="flex flex-col mt-1">
          <div class="text-base font-bold">
            {{ anime.score ? anime.score.toFixed(4) : '0.0000' }}
          </div>
          <div class="text-xs text-gray-600">
            <span>Rank: {{ anime.rank || '未排名' }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 信息区域 - 桌面端布局 -->
    <div class="flex-1 hidden sm:flex sm:flex-row sm:justify-between sm:items-start sm:flex-wrap w-full">
      <!-- 左侧信息：标题和标签 -->
      <div class="flex-grow pr-4 max-w-xl">
        <div>
          <a :href="`https://bgm.tv/subject/${anime.id}`" target="_blank" 
             class="font-bold text-base truncate block text-gray-900 hover:text-blue-600 no-underline" 
             :title="anime.name_cn || anime.name">
            {{ anime.name_cn || anime.name }}
          </a>
          <p v-if="anime.name_cn" class="text-xs text-gray-600 truncate" :title="anime.name">
            {{ anime.name }}
          </p>
        </div>
        
        <!-- 播出日和标签 -->
        <div class="mt-2">
          <div class="flex flex-wrap gap-1 items-center">
            <span 
              v-if="anime.air_weekday" 
              :class="['text-xs px-1.5 py-0.5 rounded', 'bg-green-100 text-green-800']">
              {{ anime.air_weekday }}
            </span>
            <span 
              v-for="tag in getTopTags(anime)" 
              :key="tag" 
              class="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded">
              {{ tag }}
            </span>
          </div>
          
          <!-- 收藏信息和评分人数放在标签下面 -->
          <div class="mt-2 flex items-center gap-4">
            <div class="text-xs text-gray-600 flex items-center">
              <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
              </svg>
              收藏: {{ anime.collection_total || 0 }}
            </div>
            <div class="text-xs text-gray-600 flex items-center">
              <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
              话均评论: {{ (anime.average_comment || 0).toFixed(1) }}
            </div>
            <div class="text-xs text-gray-600 flex items-center">
              <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
              抛弃率: {{ ((anime.drop_rate || 0) * 100).toFixed(1) }}%
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧信息：评分 -->
      <div class="flex-shrink-0 items-end">
        <div class="flex flex-col items-end">
          <div class="text-lg font-bold">
            {{ anime.score ? anime.score.toFixed(4) : '0.0000' }}
          </div>
          <div class="text-xs text-gray-600">
            <div>Rank: {{ anime.rank || '未排名' }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 移动端底部信息区域 -->
    <div class="w-full mt-2 sm:hidden">
      <!-- 播出日和标签 -->
      <div class="flex flex-wrap gap-1 items-center">
        <span 
          v-if="anime.air_weekday" 
          :class="['text-xs px-1 py-0.5 rounded', 'bg-green-100 text-green-800']">
          {{ anime.air_weekday }}
        </span>
        <span 
          v-for="tag in getMobileTopTags(anime)" 
          :key="tag" 
          class="bg-blue-100 text-blue-800 text-xs px-1 py-0.5 rounded">
          {{ tag }}
        </span>
      </div>
      
      <!-- 收藏信息和评分人数 -->
      <div class="mt-1 flex-nowrap flex items-center gap-0.5 justify-between info-row-mobile">
        <div class="flex items-center gap-0.5">
          <div class="flex items-center">
            <svg class="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
            </svg>
            <span class="info-text-mobile">收藏: {{ anime.collection_total || 0 }}</span>
          </div>
          <div class="flex items-center">
            <svg class="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
            <span class="info-text-mobile">话均评论: {{ (anime.average_comment || 0).toFixed(1) }}</span>
          </div>
          <div class="flex items-center">
            <svg class="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
            <span class="info-text-mobile">抛弃率: {{ ((anime.drop_rate || 0) * 100).toFixed(1) }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Anime } from '~/types'

defineProps<{
  anime: Anime
  index: number
}>()

defineEmits<{
  'show-image': [url: string, alt: string]
}>()

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.style.display = 'none'
}

const getTopTags = (anime: Anime) => {
  return anime.meta_tags || []
}

const getMobileTopTags = (anime: Anime) => {
  return anime.meta_tags || []
}
</script>
<style scoped>
.rank-badge {
  clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%);
}

.anime-list > div {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.anime-list > div:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

@media (max-width: 640px) {
  .info-row-mobile {
    flex-wrap: nowrap !important;
    gap: 2px !important;
    white-space: nowrap;
    overflow: hidden;
  }
  .info-text-mobile {
    font-size: clamp(10px, 3vw, 13px);
    margin-right: 2px;
  }
  .info-row-mobile svg {
    margin-right: 2px;
  }
  .mobile-title-clamp {
    font-size: clamp(14px, 4vw, 16px) !important;
    overflow: hidden !important;
    display: -webkit-box;
    line-height: 1.3;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-clamp: 2;
    box-orient: vertical;
    word-break: break-word;
  }
  .mobile-title-multiline {
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    display: -webkit-box;
    line-clamp: 2;
    box-orient: vertical;
  }
  .mobile-subtitle-tight {
    margin-top: 0.5px !important;
    margin-bottom: 0.5px !important;
  }
}
</style> 