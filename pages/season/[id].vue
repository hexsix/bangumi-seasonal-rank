<template>
  <div>
    <season-page v-if="isValidSeason" :season-id="$route.params.id" />
  </div>
</template>

<script>
import SeasonPage from '~/components/SeasonPage.vue'

export default {
  components: {
    SeasonPage
  },
  computed: {
    isValidSeason() {
      const season = this.$route.params.id
      // 检查格式是否为 YYYYMM
      if (!/^\d{6}$/.test(season)) return false
      
      const year = parseInt(season.substring(0, 4))
      const month = parseInt(season.substring(4, 6))
      
      // 检查年份和月份是否在合理范围内
      if (year < 2020 || year > 2030) return false
      if (month < 1 || month > 12 || month % 3 !== 1) return false
      
      return true
    }
  },
  watch: {
    isValidSeason: {
      immediate: true,
      handler(valid) {
        if (!valid) {
          this.$nuxt.error({ statusCode: 404 })
        }
      }
    }
  }
}
</script> 