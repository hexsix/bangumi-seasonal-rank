<template>
  <div class="relative flex flex-col sm:flex-row items-start p-3 mb-3 bg-white dark:bg-[#3d3d3f] rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
    <!-- 排名 -->
    <div class="rank-badge absolute top-0 left-0 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
      <div class="w-full h-full flex items-center justify-center font-bold text-sm sm:text-base text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700">
        {{ index + 1 }}
      </div>
    </div>
    
    <!-- 图片和基本信息的容器 - 在移动端横向排列 -->
    <div class="flex w-[calc(100%-1.5rem)] sm:w-auto ml-6 sm:ml-8 mb-2 sm:mb-0">
      <!-- 图片 -->
      <div class="flex-shrink-0 mr-3 sm:mr-4" @click="$emit('show-image', props.anime.images_large, props.anime.name_cn || props.anime.name)">
        <img 
          v-if="props.anime && props.anime.images_grid" 
          :src="props.anime.images_grid" 
          :alt="props.anime.name" 
          class="w-14 sm:w-16 h-20 sm:h-24 object-cover cursor-pointer rounded safari-image-fix"
          :loading="isSafari() ? 'eager' : 'lazy'"
          @error="handleImageError"
        />
        <div v-else class="w-14 sm:w-16 h-20 sm:h-24 flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 rounded">
          <span class="text-xs">暂无图片</span>
        </div>
      </div>
      
      <!-- 标题区域 - 移动端布局 -->
      <div class="flex-1 sm:hidden min-w-0">
        <a :href="`https://bgm.tv/subject/${props.anime.id}`" target="_blank" 
           class="font-bold text-sm block text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 no-underline mobile-title-clamp mobile-title-multiline" 
           :title="props.anime.name_cn || props.anime.name">
          {{ props.anime.name_cn || props.anime.name }}
        </a>
        <p v-if="props.anime.name_cn" class="text-xs text-gray-600 dark:text-gray-400 truncate mobile-subtitle-tight" :title="props.anime.name">
          {{ props.anime.name }}
        </p>
        
        <!-- 评分 - 移动端显示 -->
        <div class="flex flex-col mt-1">
          <div class="text-base font-bold text-gray-900 dark:text-gray-100">
            {{ props.anime.score ? props.anime.score.toFixed(4) : '0.0000' }}
          </div>
          <div class="text-xs text-gray-600 dark:text-gray-400">
            <span>Rank: {{ props.anime.rank || '未排名' }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 信息区域 - 桌面端布局 -->
    <div class="flex-1 hidden sm:flex sm:flex-row sm:justify-between sm:items-start sm:flex-wrap w-full">
      <!-- 左侧信息：标题和标签 -->
      <div class="flex-grow pr-4 max-w-xl">
        <div>
          <a :href="`https://bgm.tv/subject/${props.anime.id}`" target="_blank" 
             class="font-bold text-base truncate block text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 no-underline" 
             :title="props.anime.name_cn || props.anime.name">
            {{ props.anime.name_cn || props.anime.name }}
          </a>
          <p v-if="props.anime.name_cn" class="text-xs text-gray-600 dark:text-gray-400 truncate" :title="props.anime.name">
            {{ props.anime.name }}
          </p>
        </div>
        
        <!-- 播出日和标签 -->
        <div class="mt-2">
          <div class="flex flex-wrap gap-1 items-center">
            <span 
              v-if="props.anime.air_weekday" 
              :class="['text-xs px-1.5 py-0.5 rounded', 'bg-green-100 text-green-800 dark:bg-green-800/50 dark:text-green-200']">
              {{ props.anime.air_weekday }}
            </span>
            <span 
              v-for="tag in getTopTags(props.anime)" 
              :key="tag" 
              class="bg-blue-100 text-blue-800 dark:bg-blue-800/50 dark:text-blue-200 text-xs px-1.5 py-0.5 rounded">
              {{ tag }}
            </span>
          </div>
          
          <!-- 收藏信息和评分人数放在标签下面 -->
          <div class="mt-2 flex items-center gap-4">
            <div class="text-xs text-gray-600 dark:text-gray-400 flex items-center">
              <svg v-if="isTopThree('collection_total')" class="w-3 h-3 mr-1 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
              </svg>
              <svg v-else class="w-3 h-3 mr-1 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
              </svg>
              收藏: {{ props.anime.collection_total || 0 }}
            </div>
            <div class="text-xs text-gray-600 dark:text-gray-400 flex items-center">
              <svg v-if="isTopThree('average_comment')" class="w-3 h-3 mr-1 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0-.768.293-1.536.879-2.121z"></path>
              </svg>
              <svg v-else class="w-3 h-3 mr-1 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
              话均评论: {{ (props.anime.average_comment || 0).toFixed(1) }}
            </div>
            <div class="text-xs text-gray-600 dark:text-gray-400 flex items-center">
              <svg v-if="isTopThree('drop_rate')" class="w-3 h-3 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"></path>
              </svg>
              <svg v-else class="w-3 h-3 mr-1 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
              抛弃率: {{ ((props.anime.drop_rate || 0) * 100).toFixed(1) }}%
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧信息：评分 -->
      <div class="flex-shrink-0 items-end">
        <div class="flex flex-col items-end text-gray-900 dark:text-gray-100">
          <div class="text-lg font-bold">
            {{ props.anime.score ? props.anime.score.toFixed(4) : '0.0000' }}
          </div>
          <div class="text-xs text-gray-600 dark:text-gray-400">
            <div>Rank: {{ props.anime.rank || '未排名' }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 移动端底部信息区域 -->
    <div class="w-full mt-2 sm:hidden">
      <!-- 播出日和标签 -->
      <div class="flex flex-wrap gap-1 items-center">
        <span 
          v-if="props.anime.air_weekday" 
          :class="['text-xs px-1 py-0.5 rounded', 'bg-green-100 text-green-800 dark:bg-green-800/50 dark:text-green-200']">
          {{ props.anime.air_weekday }}
        </span>
        <span 
          v-for="tag in getMobileTopTags(props.anime)" 
          :key="tag" 
          class="bg-blue-100 text-blue-800 dark:bg-blue-800/50 dark:text-blue-200 text-xs px-1 py-0.5 rounded">
          {{ tag }}
        </span>
      </div>
      
      <!-- 收藏信息和评分人数 -->
      <div class="mt-1 flex-nowrap flex items-center gap-0.5 justify-between info-row-mobile text-gray-600 dark:text-gray-400">
        <div class="flex items-center gap-0.5">
          <div class="flex items-center">
            <svg v-if="isTopThree('collection_total')" class="w-3 h-3 mr-0.5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
            </svg>
            <svg v-else class="w-3 h-3 mr-0.5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
            </svg>
            <span class="info-text-mobile">收藏: {{ props.anime.collection_total || 0 }}</span>
          </div>
          <div class="flex items-center">
            <svg v-if="isTopThree('average_comment')" class="w-3 h-3 mr-0.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0-.768.293-1.536.879-2.121z"></path>
            </svg>
            <svg v-else class="w-3 h-3 mr-0.5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
            <span class="info-text-mobile">话均评论: {{ (props.anime.average_comment || 0).toFixed(1) }}</span>
          </div>
          <div class="flex items-center">
            <svg v-if="isTopThree('drop_rate')" class="w-3 h-3 mr-0.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"></path>
            </svg>
            <svg v-else class="w-3 h-3 mr-0.5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
            <span class="info-text-mobile">抛弃率: {{ ((props.anime.drop_rate || 0) * 100).toFixed(1) }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Anime } from '~/types'
import { isSafari } from '~/utils/safari-fixes'

const props = defineProps<{
  anime: Anime
  index: number
  topThreeByMetric: {
    collection_total: number[]
    average_comment: number[]
    drop_rate: number[]
    score: number[]
    rank: number[]
  }
}>()

defineEmits<{
  'show-image': [url: string, alt: string]
}>()

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.style.display = 'none'
}

const getTopTags = (anime: Anime) => {
  return [...new Set(anime.meta_tags || [])]
}

const getMobileTopTags = (anime: Anime) => {
  return [...new Set(anime.meta_tags || [])]
}

// 判断当前动画是否为指定指标的前三名
const isTopThree = (metric: keyof typeof props.topThreeByMetric) => {
  return props.topThreeByMetric[metric].includes(props.anime.id)
}
</script>
<style scoped>
.rank-badge {
  clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%);
}

/* Safari滚动优化 - 激进简化版本 */
.anime-list > div {
  /* 移除所有可能误导Safari的属性 */
  /* contain: none; */
  /* will-change: auto; */
  transform: translateZ(0); /* 仅保留GPU合成 */
  
  /* 完全移除过渡效果 */
  /* transition: none; */
}

.anime-list > div:hover {
  /* 最小化hover效果，避免重排 */
  transform: translateZ(0);
  /* opacity: 1; */
}

/* Safari浏览器中完全禁用所有动画 */
.safari-browser .anime-list > div {
  transition: none !important;
  animation: none !important;
  will-change: auto !important;
  contain: none !important;
  transform: translateZ(0) !important;
}

.safari-browser .anime-list > div:hover {
  /* Safari中完全禁用hover效果 */
  transform: translateZ(0) !important;
  opacity: 1 !important;
  box-shadow: none !important;
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
