<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
    <div class="flex flex-col sm:flex-row">
      <!-- 图片容器 -->
      <div class="image-container bg-gray-100 relative mx-auto sm:mx-0" @click="$emit('show-image', anime.images.common, anime.name_cn || anime.name)">
        <img 
          v-if="anime && anime.images && anime.images.grid" 
          :src="anime.images.grid" 
          :alt="anime.name" 
          class="w-full h-full object-contain cursor-pointer"
          loading="lazy"
          @error="handleImageError"
        />
        <div v-else class="absolute inset-0 flex items-center justify-center text-gray-400">
          <span>暂无图片</span>
        </div>
        <!-- 播出日信息覆盖在图片上 -->
        <span 
          v-if="broadcastDay" 
          :class="['absolute top-0 left-0 text-xs px-1 py-0.5 rounded-br bg-opacity-80', getBroadcastDayColorClass]">
          {{ broadcastDay }}
        </span>
        <!-- 评分信息覆盖在图片上 -->
        <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white px-2 py-1 flex justify-between items-center">
          <div class="flex items-center">
            <span class="text-yellow-400 font-bold text-xs sm:text-sm">{{ anime.rating.score.toFixed(1) }}</span>
          </div>
          <span class="text-xs">Rank: {{ anime.rating.rank }}</span>
        </div>
      </div>

      <!-- 信息区域，在移动端位于图片下方，在桌面端位于图片右侧 -->
      <div class="p-3 flex-1 flex flex-col sm:min-w-[180px]">
        <div class="mb-2">
          <a :href="`https://bgm.tv/subject/${anime.id}`" target="_blank" class="font-bold text-sm sm:text-base truncate block hover:text-blue-600" :title="anime.name_cn || anime.name">
            {{ anime.name_cn || anime.name }}
          </a>
          <p v-if="anime.name_cn" class="text-xs text-gray-600 truncate" :title="anime.name">
            {{ anime.name }}
          </p>
        </div>

        <div class="flex-1">
          <!-- 收藏信息 -->
          <div class="text-xs text-gray-600 mb-2">
            <div class="flex justify-between">
              <span>{{ getTotalRatingCount }}人评分</span>
              <span>收藏: {{ getTotalCollectionCount }}人</span>
            </div>
          </div>

          <!-- 标签云 -->
          <div class="flex flex-wrap gap-1 mt-auto">
            <span 
              v-for="tag in mobileTopTags" 
              :key="tag.name" 
              class="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded">
              {{ tag.name }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    anime: {
      type: Object,
      required: true
    }
  },
  computed: {
    topTags() {
      if (!this.anime.meta_tags || !Array.isArray(this.anime.meta_tags)) return []
      const uniqueTags = [...new Set(this.anime.meta_tags)]
      return uniqueTags.slice(0, 5).map(tag => ({ name: tag }))
    },
    mobileTopTags() {
      if (!this.anime.meta_tags || !Array.isArray(this.anime.meta_tags)) return []
      const uniqueTags = [...new Set(this.anime.meta_tags)]
      // 移动端显示较少的标签
      const isMobile = process.client && window.innerWidth < 640
      return uniqueTags.slice(0, isMobile ? 3 : 5).map(tag => ({ name: tag }))
    },
    getTotalRatingCount() {
      if (!this.anime.rating || !this.anime.rating.count) return 0
      return Object.values(this.anime.rating.count).reduce((sum, count) => sum + count, 0)
    },
    getTotalCollectionCount() {
      if (!this.anime.collection) return 0
      // 包括所有收藏状态：在看、看过、想看、搁置、抛弃
      return this.anime.collection.doing + 
             this.anime.collection.collect + 
             this.anime.collection.wish + 
             (this.anime.collection.on_hold || 0) + 
             (this.anime.collection.dropped || 0)
    },
    broadcastDay() {
      if (!this.anime.infobox || !Array.isArray(this.anime.infobox)) return null
      const broadcastInfo = this.anime.infobox.find(info => info.key === '放送星期')
      return broadcastInfo ? broadcastInfo.value : null
    },
    getBroadcastDayColorClass() {
      if (!this.broadcastDay) return 'bg-gray-100 text-gray-800'
      
      // 使用统一的颜色
      return 'bg-green-100 text-green-800'
    }
  },
  mounted() {
    // 触发响应式计算
    if (process.client) {
      window.addEventListener('resize', this.handleResize)
    }
  },
  beforeDestroy() {
    if (process.client) {
      window.removeEventListener('resize', this.handleResize)
    }
  },
  methods: {
    handleResize() {
      // 触发mobileTopTags的重新计算
      this.$forceUpdate()
    },
    handleImageError(e) {
      // 图片加载失败时只添加背景样式
      e.target.classList.add('bg-gray-300')
      // 添加一个替代文本表示图片加载失败
      const textNode = document.createElement('div')
      textNode.className = 'absolute inset-0 flex items-center justify-center text-gray-500 text-sm'
      textNode.textContent = '图片加载失败'
      e.target.parentNode.appendChild(textNode)
    }
  }
}
</script>

<style scoped>
/* 确保图片容器使用长宽比固定高度 */
.image-container {
  position: relative;
  width: 100%;
  max-width: 100px;
  height: 141px;
}

/* 在小屏幕上调整图片容器 */
@media (max-width: 639px) {
  .image-container {
    width: 100%;
    max-width: 100px;
    height: 141px;
    margin: 0 auto;
    padding: 8px 0;
  }
}

/* 在中等屏幕上调整布局 */
@media (min-width: 640px) {
  .image-container {
    width: 100px;
    min-width: 100px;
    height: 141px;
    margin: 8px;
  }
}

/* 在大屏幕上进一步优化 */
@media (min-width: 1024px) {
  .image-container {
    width: 100px;
    min-width: 100px;
    height: 141px;
    margin: 8px;
  }
}

/* 优化图片渲染 */
img {
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  transform: translateZ(0); /* 触发GPU加速 */
}
</style> 