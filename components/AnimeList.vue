<template>
  <div class="anime-list">
    <div v-for="(anime, index) in animeList" :key="anime.id" 
         class="relative flex flex-col sm:flex-row items-start p-3 mb-3 bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <!-- 排名 -->
      <div class="rank-badge absolute top-0 left-0 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
        <div class="w-full h-full flex items-center justify-center font-bold text-sm sm:text-base text-gray-700 bg-gray-100">
          {{ index + 1 }}
        </div>
      </div>
      
      <!-- 图片和基本信息的容器 - 在移动端横向排列 -->
      <div class="flex w-full sm:w-auto ml-6 sm:ml-8 mb-2 sm:mb-0">
        <!-- 图片 -->
        <div class="flex-shrink-0 mr-3 sm:mr-4" @click="$emit('show-image', anime.images.common, anime.name_cn || anime.name)">
          <img 
            v-if="anime && anime.images && anime.images.grid" 
            :src="anime.images.grid" 
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
        <div class="flex-1 sm:hidden">
          <a :href="`https://bgm.tv/subject/${anime.id}`" target="_blank" 
             class="font-bold text-sm truncate block hover:text-blue-600" 
             :title="anime.name_cn || anime.name">
            {{ anime.name_cn || anime.name }}
          </a>
          <p v-if="anime.name_cn" class="text-xs text-gray-600 truncate" :title="anime.name">
            {{ anime.name }}
          </p>
          
          <!-- 评分 - 移动端显示 -->
          <div class="flex flex-col mt-1">
            <div class="text-base font-bold">
              {{ calculateWeightedScore(anime).toFixed(4) }}
            </div>
            <div class="text-xs text-gray-600">
              <span>Rank: {{ anime.rating.rank }}</span>
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
               class="font-bold text-base truncate block hover:text-blue-600" 
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
                v-if="getBroadcastDay(anime)" 
                :class="['text-xs px-1.5 py-0.5 rounded', 'bg-green-100 text-green-800']">
                {{ getBroadcastDay(anime) }}
              </span>
              <span 
                v-for="tag in getTopTags(anime)" 
                :key="tag.name" 
                class="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded">
                {{ tag.name }}
              </span>
            </div>
            
            <!-- 收藏信息和评分人数放在标签下面 -->
            <div class="mt-2 flex items-center gap-4">
              <div class="text-xs text-gray-600 flex items-center">
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
                </svg>
                收藏: {{ getTotalCollectionCount(anime) }}人
              </div>
              <div class="text-xs text-gray-600 flex items-center">
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                </svg>
                评分: {{ getTotalRatingCount(anime) }}人
              </div>
              <div class="text-xs text-gray-600 flex items-center">
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                抛弃率: {{ calculateDropRate(anime) }}%
              </div>
              <div v-if="anime.air_date" class="text-xs text-gray-500">
                {{ anime.air_date }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- 右侧信息：评分 - 删除了中间的收藏信息区域 -->
        <div class="flex-shrink-0 items-end">
          <div class="flex flex-col items-end">
            <div class="text-lg font-bold">
              {{ calculateWeightedScore(anime).toFixed(4) }}
            </div>
            <div class="text-xs text-gray-600">
              <div>Rank: {{ anime.rating.rank }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 移动端底部信息区域 -->
      <div class="w-full mt-2 sm:hidden">
        <!-- 播出日和标签 -->
        <div class="flex flex-wrap gap-1 items-center">
          <span 
            v-if="getBroadcastDay(anime)" 
            :class="['text-xs px-1 py-0.5 rounded', 'bg-green-100 text-green-800']">
            {{ getBroadcastDay(anime) }}
          </span>
          <span 
            v-for="tag in getMobileTopTags(anime)" 
            :key="tag.name" 
            class="bg-blue-100 text-blue-800 text-xs px-1 py-0.5 rounded">
            {{ tag.name }}
          </span>
        </div>
        
        <!-- 收藏信息和评分人数 -->
        <div class="mt-1 text-xs text-gray-600 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="flex items-center">
              <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
              </svg>
              收藏: {{ getTotalCollectionCount(anime) }}人
            </div>
            <div class="flex items-center">
              <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
              </svg>
              评分: {{ getTotalRatingCount(anime) }}人
            </div>
            <div class="flex items-center">
              <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
              抛弃率: {{ calculateDropRate(anime) }}%
            </div>
          </div>
          <div v-if="anime.air_date" class="text-xs text-gray-500">
            {{ anime.air_date }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    animeList: {
      type: Array,
      required: true
    }
  },
  methods: {
    handleImageError(e) {
      e.target.classList.add('bg-gray-300')
      const textNode = document.createElement('div')
      textNode.className = 'absolute inset-0 flex items-center justify-center text-gray-500 text-sm'
      textNode.textContent = '图片加载失败'
      e.target.parentNode.appendChild(textNode)
    },
    getTopTags(anime) {
      if (!anime.meta_tags || !Array.isArray(anime.meta_tags)) return []
      const uniqueTags = [...new Set(anime.meta_tags)]
      return uniqueTags.slice(0, 5).map(tag => ({ name: tag }))
    },
    getMobileTopTags(anime) {
      if (!anime.meta_tags || !Array.isArray(anime.meta_tags)) return []
      const uniqueTags = [...new Set(anime.meta_tags)]
      // 移动端显示较少的标签
      return uniqueTags.slice(0, 3).map(tag => ({ name: tag }))
    },
    getTotalRatingCount(anime) {
      if (!anime.rating || !anime.rating.count) return 0
      return Object.values(anime.rating.count).reduce((sum, count) => sum + count, 0)
    },
    calculateWeightedScore(anime) {
      if (!anime.rating || !anime.rating.count) return 0
      let totalScore = 0
      let totalCount = 0
      
      Object.entries(anime.rating.count).forEach(([score, count]) => {
        totalScore += parseInt(score) * count
        totalCount += count
      })
      
      return totalCount > 0 ? totalScore / totalCount : 0
    },
    getTotalCollectionCount(anime) {
      if (!anime.collection) return 0
      return anime.collection.doing + 
             anime.collection.collect + 
             anime.collection.wish + 
             (anime.collection.on_hold || 0) + 
             (anime.collection.dropped || 0)
    },
    calculateDropRate(anime) {
      if (!anime.collection) return 0
      const totalCollection = this.getTotalCollectionCount(anime)
      if (totalCollection === 0) return 0
      return ((anime.collection.dropped || 0) / totalCollection * 100).toFixed(1)
    },
    getBroadcastDay(anime) {
      if (!anime.infobox || !Array.isArray(anime.infobox)) return null
      const broadcastInfo = anime.infobox.find(info => info.key === '放送星期')
      return broadcastInfo ? broadcastInfo.value : null
    }
  }
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
</style> 