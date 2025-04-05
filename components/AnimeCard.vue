<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
    <div class="relative pb-[140%]">
      <img 
        :src="anime.images.common" 
        :alt="anime.name" 
        class="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
    </div>
    <div class="p-4">
      <h3 class="font-bold text-lg truncate" :title="anime.name_cn || anime.name">
        {{ anime.name_cn || anime.name }}
      </h3>
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
      if (!this.anime.tags || !Array.isArray(this.anime.tags)) return []
      return this.anime.tags.slice(0, 5)
    },
    getTotalRatingCount() {
      if (!this.anime.rating || !this.anime.rating.count) return 0
      return Object.values(this.anime.rating.count).reduce((sum, count) => sum + count, 0)
    }
  }
}
</script> 