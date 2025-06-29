export const state = () => ({
  // 季度列表 - 从API动态获取
  seasons: [],
  
  // 当前季度ID
  currentSeasonId: null,
  
  // 动画数据缓存
  animeData: {}
})

export const mutations = {
  SET_SEASONS(state, { seasons, currentSeasonId }) {
    state.seasons = seasons
    state.currentSeasonId = currentSeasonId
  },
  
  SET_ANIME_DATA(state, { season, data }) {
    state.animeData = {
      ...state.animeData,
      [season]: data
    }
  }
}

export const actions = {
  async loadAvailableSeasons({ commit }) {
    try {
      const response = await this.$axios.get('/api/v0/season/available')
      const { available_seasons, current_season_id } = response.data
      
      commit('SET_SEASONS', { 
        seasons: available_seasons.map(String), // 确保转换成字符串
        currentSeasonId: String(current_season_id)
      })
      
      return { seasons: available_seasons, currentSeasonId: current_season_id }
    } catch (error) {
      console.error('Failed to load available seasons:', error)
      // 使用fallback数据
      const fallbackSeasons = ['202504', '202501', '202410', '202407', '202404']
      commit('SET_SEASONS', { 
        seasons: fallbackSeasons,
        currentSeasonId: '202504'
      })
      return { seasons: fallbackSeasons, currentSeasonId: '202504' }
    }
  },

  async loadSeasonData({ commit, state }, season) {
    // 如果数据已经存在，直接返回
    if (state.animeData[season]) {
      return state.animeData[season]
    }
    
    try {
      const response = await this.$axios.get(`/api/v0/season/${season}`)
      const apiData = response.data
      
      // 直接使用API数据
      commit('SET_ANIME_DATA', { season, data: apiData })
      return apiData
    } catch (error) {
      console.error(`Failed to load data for season ${season}:`, error)
      throw error
    }
  }
}

export const getters = {
  getSeasons: state => state.seasons,
  getCurrentSeasonId: state => state.currentSeasonId,
  getAnimeData: state => season => state.animeData[season] || null
}

 