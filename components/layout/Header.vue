<template>
  <header class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <div class="flex items-center">
          <NuxtLink to="/" class="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors no-underline">
            {{ pageTitle }}
          </NuxtLink>
        </div>

        <!-- 导航菜单 (桌面) -->
        <nav class="hidden md:flex space-x-4">
          <NuxtLink
            v-for="season in recentSeasons"
            :key="season.season_id"
            :to="`/${season.season_id}`"
            class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors no-underline"
            active-class="text-blue-600 bg-blue-50"
          >
            {{ formatSeasonNameShort(season.season_id) }}
          </NuxtLink>
          <NuxtLink
            to="/list"
            class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors no-underline"
            active-class="text-blue-600 bg-blue-50"
          >
            更多
          </NuxtLink>
        </nav>

        <!-- 移动端菜单按钮 -->
        <div class="md:hidden">
          <button class="text-gray-700 hover:text-blue-600" @click="toggleMobileMenu">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      <!-- 移动端菜单 -->
      <div v-if="mobileMenuOpen" class="md:hidden">
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <NuxtLink
            v-for="season in recentSeasons"
            :key="season.season_id"
            :to="`/${season.season_id}`"
            class="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium no-underline"
            active-class="text-blue-600 bg-blue-50"
            @click="mobileMenuOpen = false"
          >
            {{ formatSeasonNameShort(season.season_id) }}
          </NuxtLink>
          <NuxtLink
            to="/list"
            class="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium no-underline"
            active-class="text-blue-600 bg-blue-50"
            @click="mobileMenuOpen = false"
          >
            更多季度
          </NuxtLink>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { formatTitle } from '~/utils/helpers'

const mobileMenuOpen = ref(false)
const route = useRoute()
const { seasons } = useSeasons()

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const pageTitle = computed(() => {
  if (route.name === 'season_id' && route.params.season_id) {
    return formatTitle(route.params.season_id as string)
  }
  return 'Bangumi.tv 动画季度排行榜'
})

const recentSeasons = computed(() => {
  if (seasons.value?.seasons) {
    return seasons.value.seasons.slice(0, 6)
  }
  return []
})

function formatSeasonNameShort(seasonId: string): string {
  const year = seasonId.slice(2, 4)
  const month = parseInt(seasonId.slice(4, 6))
  return `${year}年${month}月`
}
</script>