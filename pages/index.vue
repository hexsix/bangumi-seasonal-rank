<template>
  <div>
    <season-page :season-id="latestSeason" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import SeasonPage from '~/components/SeasonPage.vue'

export default {
  components: {
    SeasonPage
  },
  computed: {
    ...mapGetters({
      getSeasons: 'getSeasons'
    }),
    latestSeason() {
      return this.getSeasons[0] || '202504'
    }
  }
}
</script> 