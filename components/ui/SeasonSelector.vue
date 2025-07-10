<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">选择季度</h3>
    <div class="space-y-4">
      <div v-for="year in years" :key="year" class="border-b border-gray-100 pb-4 last:border-b-0">
        <h4 class="text-md font-medium text-gray-700 mb-2">{{ year }}年</h4>
        <div class="grid grid-cols-2 gap-2">
          <NuxtLink
            v-for="season in groupedSeasons[year]"
            :key="season.season_id"
            :to="`/${season.season_id}`"
            :class="[
              'px-3 py-2 text-sm rounded transition-colors',
              $route.params.season_id === season.season_id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            {{ formatSeasonName(season.season_id) }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatSeasonName } from '~/utils/helpers'

defineProps({
  groupedSeasons: {
    type: Object,
    required: true
  },
  years: {
    type: Array,
    required: true
  }
})
</script> 