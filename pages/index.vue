<template>
  <div class="container mx-auto p-4 max-w-screen-lg">
    <h1 class="text-3xl font-bold mb-6 text-center">Bangumi 动画季度排行榜</h1>
    <p class="text-sm text-gray-600 mb-6 text-center">
      不含TVSP，不含OVA/OAD，不含国产动画。感谢 <a href="https://bgm.tv/user/lilyurey/index" target="_blank" class="text-blue-500 hover:underline">lilyurey@bgm</a> 编纂的目录。
      <a href="https://github.com/hexsix/bangumi-seasonal-rank" target="_blank" class="inline-flex items-center ml-2 text-gray-600 hover:text-blue-600">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-github" viewBox="0 0 16 16">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
        </svg>
      </a>
    </p>
    
    <div class="flex flex-col sm:flex-row sm:justify-between mb-4 sm:mb-6 gap-4 sm:gap-0 items-start">
      <!-- 选择季度 -->
      <div>
        <label class="block mb-2">选择季度：</label>
        <select v-model="selectedSeason" class="p-2 border rounded w-full sm:w-64" @change="loadSeasonData">
          <option v-for="season in seasons" :key="season" :value="season">{{ formatSeason(season) }}</option>
        </select>
      </div>

      <div class="flex flex-col gap-2 sm:items-end w-full sm:w-auto">
        <!-- 更新时间 -->
        <div v-if="lastUpdateTime" class="text-xs sm:text-sm text-gray-600 flex items-center self-end">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 sm:h-4 sm:w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          数据更新时间: {{ formatDateTime(lastUpdateTime) }}
        </div>
        
        <!-- 排序选项 -->
        <div class="flex flex-wrap gap-2 justify-end mt-2">
          <button 
            v-for="option in [{field: 'rank', label: 'Rank'}, {field: 'score', label: '评分'}, {field: 'collectionCount', label: '收藏人数'}, {field: 'commentPerEpisode', label: '话均评论'}]" 
            :key="option.field"
            @click="sortBy(option.field)"
            :class="['px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm rounded border', sortField === option.field ? 'bg-blue-500 text-white' : 'bg-gray-100']"
          >
            {{ option.label }} 
            <span v-if="sortField === option.field">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
          </button>
        </div>
      </div>
    </div>

    <loading-spinner v-if="loading" message="加载数据中..." />

    <div v-else>
      <div class="max-w-full">
        <anime-list :anime-list="sortedAnimeList" @show-image="showLargeImage" />
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
import AnimeList from '~/components/AnimeList.vue'

export default {
  components: {
    LoadingSpinner,
    AnimeList
  },
  data() {
    return {
      selectedSeason: '202504', // 默认选择最新季度
      animeList: [],
      seasonTitle: '',
      loading: true,
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
        } else if (this.sortField === 'collectionCount') {
          comparison = this.getTotalCollectionCount(a) - this.getTotalCollectionCount(b);
        } else if (this.sortField === 'commentPerEpisode') {
          const commentPerEpisodeA = this.getCommentPerEpisode(a);
          const commentPerEpisodeB = this.getCommentPerEpisode(b);
          comparison = commentPerEpisodeA - commentPerEpisodeB;
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
      // 使用Set去重
      const uniqueTags = [...new Set(anime.meta_tags)]
      return uniqueTags.slice(0, 5).map(tag => ({ name: tag }))
    },
    getBroadcastDay(anime) {
      if (!anime.infobox || !Array.isArray(anime.infobox)) return null
      const broadcastInfo = anime.infobox.find(info => info.key === '放送星期')
      return broadcastInfo ? broadcastInfo.value : null
    },
    getBroadcastDayColorClass(anime) {
      const broadcastDay = this.getBroadcastDay(anime)
      if (!broadcastDay) return 'bg-gray-100 text-gray-800'
      
      // 使用统一的颜色
      return 'bg-green-100 text-green-800'
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
    },
    getCommentPerEpisode(anime) {
      if (!anime.episodes_summary || !anime.episodes_summary.aired_episodes || anime.episodes_summary.aired_episodes === 0) return 0;
      return anime.episodes_summary.total_comments / anime.episodes_summary.aired_episodes;
    }
  }
}
</script>

<style scoped>
/* 可以添加自定义样式 */
</style> 