<template>
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-6 text-center">Bangumi 动画季度排行榜</h1>
    
    <div class="flex justify-between mb-6">
      <div>
        <label class="block mb-2">选择季度：</label>
        <select v-model="selectedSeason" class="p-2 border rounded w-64" @change="loadSeasonData">
          <option v-for="season in seasons" :key="season" :value="season">{{ formatSeason(season) }}</option>
        </select>
      </div>
      
      <div>
        <label class="block mb-2">显示模式：</label>
        <div class="flex border rounded overflow-hidden">
          <button 
            @click="viewMode = 'table'" 
            :class="['px-4 py-2', viewMode === 'table' ? 'bg-blue-500 text-white' : 'bg-gray-100']"
          >
            表格
          </button>
          <button 
            @click="viewMode = 'cards'" 
            :class="['px-4 py-2', viewMode === 'cards' ? 'bg-blue-500 text-white' : 'bg-gray-100']"
          >
            卡片
          </button>
        </div>
      </div>
    </div>

    <loading-spinner v-if="loading" message="加载数据中..." />

    <div v-else>
      <h2 class="text-2xl font-bold mb-4">{{ seasonTitle }}</h2>
      
      <!-- 表格视图 -->
      <div v-if="viewMode === 'table'" class="overflow-x-auto">
        <table class="min-w-full bg-white border border-gray-200">
          <thead class="bg-gray-100">
            <tr>
              <th class="py-3 px-4 border-b text-left">序号</th>
              <th class="py-3 px-4 border-b text-left">海报</th>
              <th class="py-3 px-4 border-b text-left">名称</th>
              <th class="py-3 px-4 border-b text-left cursor-pointer" @click="sortBy('score')">
                评分 <span v-if="sortField === 'score'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th class="py-3 px-4 border-b text-left cursor-pointer" @click="sortBy('rank')">
                Rank <span v-if="sortField === 'rank'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th class="py-3 px-4 border-b text-left cursor-pointer" @click="sortBy('ratingCount')">
                评分人数 <span v-if="sortField === 'ratingCount'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th class="py-3 px-4 border-b text-left cursor-pointer" @click="sortBy('collectionCount')">
                收藏人数 <span v-if="sortField === 'collectionCount'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th class="py-3 px-4 border-b text-left">标签</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(anime, index) in sortedAnimeList" :key="anime.id" class="hover:bg-gray-50">
              <td class="py-3 px-4 border-b">{{ index + 1 }}</td>
              <td class="py-3 px-4 border-b">
                <img 
                  :src="anime.images.grid" 
                  :alt="anime.name" 
                  class="w-16 h-auto rounded cursor-pointer" 
                  @click="showLargeImage(anime.images.common, anime.name_cn || anime.name)"
                >
              </td>
              <td class="py-3 px-4 border-b">
                <a :href="`https://bgm.tv/subject/${anime.id}`" target="_blank" class="font-bold hover:text-blue-600">
                  {{ anime.name_cn || anime.name }}
                </a>
                <div v-if="anime.name_cn" class="text-sm text-gray-600">{{ anime.name }}</div>
              </td>
              <td class="py-3 px-4 border-b">
                <div class="font-bold">{{ anime.rating.score.toFixed(1) }}</div>
              </td>
              <td class="py-3 px-4 border-b">{{ anime.rating.rank }}</td>
              <td class="py-3 px-4 border-b">{{ getTotalRatingCount(anime) }}</td>
              <td class="py-3 px-4 border-b">{{ getTotalCollectionCount(anime) }}</td>
              <td class="py-3 px-4 border-b">
                <div class="flex flex-wrap gap-1">
                  <span 
                    v-for="tag in getMetaTags(anime)" 
                    :key="tag.name" 
                    class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {{ tag.name }}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 卡片视图 -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <div v-for="(anime, index) in sortedAnimeList" :key="anime.id" class="relative">
          <div class="absolute -top-3 -left-3 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-md">
            {{ index + 1 }}
          </div>
          <anime-card :anime="anime" @show-image="showLargeImage" />
        </div>
      </div>
    </div>

    <!-- 大图查看模态框 -->
    <div v-if="largeImageShow" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" @click="largeImageShow = false">
      <div class="max-w-3xl max-h-[90vh] relative">
        <img :src="largeImageUrl" :alt="largeImageAlt" class="max-w-full max-h-[90vh] object-contain">
        <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-center">
          {{ largeImageAlt }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import LoadingSpinner from '~/components/LoadingSpinner.vue'
import AnimeCard from '~/components/AnimeCard.vue'

export default {
  components: {
    LoadingSpinner,
    AnimeCard
  },
  data() {
    return {
      selectedSeason: '202504', // 默认选择最新季度
      animeList: [],
      seasonTitle: '',
      loading: true,
      viewMode: 'table', // table 或 cards
      sortField: 'score', // 默认按评分排序
      sortOrder: 'desc', // 默认降序
      largeImageShow: false,
      largeImageUrl: '',
      largeImageAlt: ''
    }
  },
  computed: {
    ...mapGetters({
      getSeasons: 'getSeasons',
      getAnimeData: 'getAnimeData'
    }),
    seasons() {
      return this.getSeasons
    },
    sortedAnimeList() {
      return [...this.animeList].sort((a, b) => {
        let comparison = 0;
        
        if (this.sortField === 'score') {
          comparison = a.rating.score - b.rating.score;
        } else if (this.sortField === 'rank') {
          // 注意：rank更小表示排名更高
          comparison = a.rating.rank - b.rating.rank;
        } else if (this.sortField === 'ratingCount') {
          comparison = this.getTotalRatingCount(a) - this.getTotalRatingCount(b);
        } else if (this.sortField === 'collectionCount') {
          comparison = this.getTotalCollectionCount(a) - this.getTotalCollectionCount(b);
        }
        
        return this.sortOrder === 'asc' ? comparison : -comparison;
      });
    }
  },
  async mounted() {
    await this.loadSeasonData()
  },
  methods: {
    async loadSeasonData() {
      this.loading = true
      
      try {
        // 从Vuex存储获取数据
        let data = this.getAnimeData(this.selectedSeason)
        
        // 如果存储中没有，尝试加载
        if (!data) {
          data = await this.$store.dispatch('loadSeasonData', this.selectedSeason)
        }
        
        if (data && data.subjects) {
          this.animeList = data.subjects
          this.seasonTitle = data.title
        } else {
          throw new Error('Invalid data format')
        }
      } catch (error) {
        console.error(`Failed to load data for season ${this.selectedSeason}:`, error)
        this.animeList = []
        this.seasonTitle = '数据加载失败'
      } finally {
        this.loading = false
      }
    },
    formatSeason(season) {
      if (!season || season.length !== 6) return season
      const year = season.substring(0, 4)
      const month = season.substring(4, 6)
      return `${year}年${month}月`
    },
    getTotalRatingCount(anime) {
      if (!anime.rating || !anime.rating.count) return 0
      return Object.values(anime.rating.count).reduce((sum, count) => sum + count, 0)
    },
    getTotalCollectionCount(anime) {
      if (!anime.collection) return 0
      // 包括所有收藏状态：在看、看过、想看、搁置、抛弃
      return anime.collection.doing + 
             anime.collection.collect + 
             anime.collection.wish + 
             (anime.collection.on_hold || 0) + 
             (anime.collection.dropped || 0)
    },
    getMetaTags(anime) {
      // 使用meta_tags而不是tags
      if (!anime.meta_tags || !Array.isArray(anime.meta_tags)) return []
      return anime.meta_tags.slice(0, 5)
    },
    sortBy(field) {
      if (this.sortField === field) {
        // 如果已经按此字段排序，则切换排序方向
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
      } else {
        // 否则，切换排序字段，并默认降序
        this.sortField = field
        this.sortOrder = 'desc'
      }
    },
    showLargeImage(url, alt) {
      this.largeImageUrl = url
      this.largeImageAlt = alt
      this.largeImageShow = true
    }
  }
}
</script>

<style scoped>
/* 可以添加自定义样式 */
</style> 