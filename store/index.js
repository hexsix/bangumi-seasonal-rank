// 导入预加载的数据
import data202504 from '@/static/202504.json'

export const state = () => ({
  // 季度列表
  seasons: [
    '202504', '202501', '202410', '202407', '202404', '202401',
    '202310', '202307', '202304', '202301', '202210', '202207',
    '202204', '202201', '202110', '202107', '202104', '202101',
    '202010', '202007', '202004', '202001', '201910', '201907',
    '201904', '201901', '201810', '201807', '201804', '201801',
    '201710', '201707', '201704'
  ],
  
  // 默认预加载当前季度数据
  animeData: {
    '202504': data202504
  }
})

export const mutations = {
  SET_ANIME_DATA(state, { season, data }) {
    state.animeData = {
      ...state.animeData,
      [season]: data
    }
  }
}

export const actions = {
  async loadSeasonData({ commit, state }, season) {
    // 如果数据已经存在，直接返回
    if (state.animeData[season]) {
      return state.animeData[season]
    }
    
    try {
      // 否则尝试加载
      const response = await this.$axios.get(`/${season}.json`)
      const data = response.data
      
      // 保存到状态中
      commit('SET_ANIME_DATA', { season, data })
      return data
    } catch (error) {
      console.error(`Failed to load data for season ${season}:`, error)
      throw error
    }
  }
}

export const getters = {
  getSeasons: state => state.seasons,
  getAnimeData: state => season => state.animeData[season] || null
} 