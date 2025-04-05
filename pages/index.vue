<template>
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-6 text-center">Bangumi 动画季度排行榜</h1>
    <p class="text-sm text-gray-600 mb-6 text-center">
      不含TVSP，不含OVA/OAD，不含国产动画。感谢 <a href="https://bgm.tv/user/lilyurey/index" target="_blank" class="text-blue-500 hover:underline">lilyurey@bgm</a> 编纂的目录。
      <a href="https://github.com/hexsix/bangumi-seasonal-rank" target="_blank" class="inline-flex items-center ml-2 text-gray-600 hover:text-blue-600">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-github" viewBox="0 0 16 16">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
        </svg>
      </a>
    </p>
    
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
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">{{ seasonTitle }}</h2>
        <div v-if="lastUpdateTime" class="text-sm text-gray-600 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          数据更新时间: {{ formatDateTime(lastUpdateTime) }}
        </div>
      </div>
      
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
      sortField: 'rank', // 默认按rank排序
      sortOrder: 'asc', // 对于rank是升序（数字越小排名越高）
      largeImageShow: false,
      largeImageUrl: '',
      largeImageAlt: '',
      lastUpdateTime: null
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
          // 处理rank为0的情况，将其视为无限大
          const rankA = a.rating.rank === 0 ? Infinity : a.rating.rank;
          const rankB = b.rating.rank === 0 ? Infinity : b.rating.rank;
          comparison = rankA - rankB;
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
          this.lastUpdateTime = data.last_update_time
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
      // 使用meta_tags字段，它是一个字符串数组
      if (!anime.meta_tags || !Array.isArray(anime.meta_tags)) return []
      return anime.meta_tags.slice(0, 5).map(tag => ({ name: tag }))
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
    },
    formatDateTime(timestamp) {
      if (!timestamp) return '未知时间'
      // 直接解析ISO格式的时间字符串
      const date = new Date(timestamp)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }
  }
}
</script>

<style scoped>
/* 可以添加自定义样式 */
</style> 