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
              <th class="py-3 px-4 border-b text-left">排名</th>
              <th class="py-3 px-4 border-b text-left">海报</th>
              <th class="py-3 px-4 border-b text-left">名称</th>
              <th class="py-3 px-4 border-b text-left">评分</th>
              <th class="py-3 px-4 border-b text-left">评分人数</th>
              <th class="py-3 px-4 border-b text-left">收藏人数</th>
              <th class="py-3 px-4 border-b text-left">标签</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(anime, index) in sortedAnimeList" :key="anime.id" class="hover:bg-gray-50">
              <td class="py-3 px-4 border-b">{{ index + 1 }}</td>
              <td class="py-3 px-4 border-b">
                <img :src="anime.images.grid" :alt="anime.name" class="w-16 h-auto rounded">
              </td>
              <td class="py-3 px-4 border-b">
                <div class="font-bold">{{ anime.name_cn || anime.name }}</div>
                <div v-if="anime.name_cn" class="text-sm text-gray-600">{{ anime.name }}</div>
              </td>
              <td class="py-3 px-4 border-b">
                <div class="font-bold">{{ anime.rating.score.toFixed(1) }}</div>
                <div class="text-sm text-gray-600">Rank: {{ anime.rating.rank }}</div>
              </td>
              <td class="py-3 px-4 border-b">{{ getTotalRatingCount(anime) }}</td>
              <td class="py-3 px-4 border-b">
                <div>在看: {{ anime.collection.doing }}</div>
                <div>看过: {{ anime.collection.collect }}</div>
                <div>想看: {{ anime.collection.wish }}</div>
              </td>
              <td class="py-3 px-4 border-b">
                <div class="flex flex-wrap gap-1">
                  <span 
                    v-for="tag in getTopTags(anime.tags)" 
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
          <anime-card :anime="anime" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LoadingSpinner from '~/components/LoadingSpinner.vue'
import AnimeCard from '~/components/AnimeCard.vue'

export default {
  components: {
    LoadingSpinner,
    AnimeCard
  },
  data() {
    return {
      // 预定义的季度列表
      defaultSeasons: [
        '202504', '202501', '202410', '202407', '202404', '202401',
        '202310', '202307', '202304', '202301', '202210', '202207',
        '202204', '202201', '202110', '202107', '202104', '202101',
        '202010', '202007', '202004', '202001', '201910', '201907',
        '201904', '201901', '201810', '201807', '201804', '201801',
        '201710', '201707', '201704'
      ],
      seasons: [],
      selectedSeason: null,
      animeList: [],
      seasonTitle: '',
      loading: true,
      viewMode: 'table' // table 或 cards
    }
  },
  computed: {
    sortedAnimeList() {
      // 按评分从高到低排序
      return [...this.animeList].sort((a, b) => b.rating.score - a.rating.score)
    }
  },
  async mounted() {
    await this.getAvailableSeasons()
    if (this.seasons.length > 0) {
      this.selectedSeason = this.seasons[0]
      await this.loadSeasonData()
    }
  },
  methods: {
    async getAvailableSeasons() {
      try {
        // 尝试从生成的文件中获取季度列表
        const { data } = await this.$axios.get('/_nuxt/public-files.json', { 
          validateStatus: () => true 
        })
        
        if (data && Array.isArray(data) && data.length > 0) {
          this.seasons = data
            .filter(file => file.endsWith('.json') && /^\d{6}\.json$/.test(file))
            .map(file => file.replace('.json', ''))
            .sort((a, b) => b.localeCompare(a)) // 降序排序，最新的季度在前面
        } else {
          // 如果获取失败，使用默认列表
          this.seasons = this.defaultSeasons
        }
      } catch (error) {
        console.error('Failed to get seasons:', error)
        // 如果获取失败，使用默认列表
        this.seasons = this.defaultSeasons
      }
    },
    async loadSeasonData() {
      this.loading = true
      try {
        const { data } = await this.$axios.get(`/${this.selectedSeason}.json`)
        this.animeList = data.subjects
        this.seasonTitle = data.title
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
    getTopTags(tags) {
      // 返回前5个标签
      if (!tags || !Array.isArray(tags)) return []
      return tags.slice(0, 5)
    }
  }
}
</script>

<style scoped>
/* 可以添加自定义样式 */
</style> 