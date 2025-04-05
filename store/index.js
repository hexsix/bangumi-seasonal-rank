// 导入预加载的数据
import data202504 from '@/static/202504.json'
import data202501 from '@/static/202501.json'

export const state = () => ({
  // 季度列表 - 静态列表，在构建时确定
  seasons: [
    '202504',
    '202501',
    '202410',
    '202407',
    '202404',
    '202401',
    '202310',
    '202307',
    '202304',
    '202301',
    '202210',
    '202207',
    '202204',
    '202201',
    '202110',
    '202107',
    '202104',
    '202101',
    '202010',
    '202007',
    '202004',
    '202001',
    '201910',
    '201907',
    '201904',
    '201901',
    '201810',
    '201807',
    '201804',
    '201801',
    '201710',
    '201707',
    '201704',
    '201701',
    '201610',
    '201607',
    '201604',
    '201601',
    '201510',
    '201507',
    '201504',
    '201501',
    '201410',
    '201407',
    '201404',
    '201401',
    '201310',
    '201307',
    '201304',
    '201301',
    '201210',
    '201207',
    '201204'
  ],
  
  // 默认预加载当前季度数据
  animeData: {
    '202504': data202504,
    '202501': data202501
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
      // 在静态生成的环境中，我们需要使用动态导入而不是axios请求
      let data
      
      // 静态部署环境下使用动态导入
      if (process.static) {
        try {
          // 动态导入JSON文件
          const module = await import(`@/static/${season}.json`);
          data = module.default
        } catch (importError) {
          console.error(`Failed to import data for season ${season}:`, importError)
          // 导入失败回退到axios请求
          const response = await this.$axios.get(`/${season}.json`)
          data = response.data
        }
      } else {
        // 开发环境下使用axios请求
        const response = await this.$axios.get(`/${season}.json`)
        data = response.data
      }
      
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