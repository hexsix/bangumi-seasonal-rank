<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
    <div class="relative pb-[140%]">
      <img 
        :src="anime.images.grid" 
        :alt="anime.name" 
        class="absolute inset-0 w-full h-full object-cover cursor-pointer"
        loading="lazy"
        @click="$emit('show-image', anime.images.common, anime.name_cn || anime.name)"
      />
    </div>
    <div class="p-2 sm:p-4">
      <a :href="`https://bgm.tv/subject/${anime.id}`" target="_blank" class="font-bold text-sm sm:text-lg truncate block hover:text-blue-600" :title="anime.name_cn || anime.name">
        {{ anime.name_cn || anime.name }}
      </a>
      <p v-if="anime.name_cn" class="text-xs sm:text-sm text-gray-600 truncate" :title="anime.name">
        {{ anime.name }}
      </p>
      <div class="flex items-center mt-1 sm:mt-2">
        <span class="text-yellow-500 font-bold text-sm sm:text-base">{{ anime.rating.score.toFixed(1) }}</span>
        <span class="ml-1 sm:ml-2 text-xs sm:text-sm text-gray-500">
          ({{ getTotalRatingCount }}人评分)
        </span>
      </div>
      <div class="flex justify-between text-xs text-gray-600 mt-1">
        <span>Rank: {{ anime.rating.rank }}</span>
        <span>收藏: {{ getTotalCollectionCount }}人</span>
      </div>
      <div class="flex flex-wrap gap-1 mt-1 sm:mt-2">
        <span 
          v-if="broadcastDay" 
          :class="['text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded', getBroadcastDayColorClass]">
          {{ broadcastDay }}
        </span>
        <span 
          v-for="tag in mobileTopTags" 
          :key="tag.name" 
          class="bg-blue-100 text-blue-800 text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded">
          {{ tag.name }}
        </span>
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
    }
  }
}
</script> 