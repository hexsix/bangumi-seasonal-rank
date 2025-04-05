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
    <div class="p-4">
      <a :href="`https://bgm.tv/subject/${anime.id}`" target="_blank" class="font-bold text-lg truncate block hover:text-blue-600" :title="anime.name_cn || anime.name">
        {{ anime.name_cn || anime.name }}
      </a>
      <p v-if="anime.name_cn" class="text-sm text-gray-600 truncate" :title="anime.name">
        {{ anime.name }}
      </p>
      <div class="flex items-center mt-2">
        <span class="text-yellow-500 font-bold">{{ anime.rating.score.toFixed(1) }}</span>
        <span class="ml-2 text-sm text-gray-500">
          ({{ getTotalRatingCount }}人评分)
        </span>
      </div>
      <div class="text-xs text-gray-600 mt-1">
        Rank: {{ anime.rating.rank }}
      </div>
      <div class="text-xs text-gray-600 mt-1">
        收藏: {{ getTotalCollectionCount }}人
      </div>
      <div class="flex flex-wrap gap-1 mt-2">
        <span 
          v-for="tag in topTags" 
          :key="tag.name" 
          class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
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
      return this.anime.meta_tags.slice(0, 5).map(tag => ({ name: tag }))
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
    }
  }
}
</script> 