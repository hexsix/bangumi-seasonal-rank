<template>
  <header class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center min-h-16 relative">
        <!-- Logo - 桌面端左侧，移动端居中 -->
        <div class="flex items-center md:flex-1">
          <NuxtLink to="/" class="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors no-underline md:text-left text-center md:w-auto w-full clamp-title">
            {{ pageTitle }}
          </NuxtLink>
        </div>

        <!-- 导航菜单 (桌面) - 居中 -->
        <nav class="hidden md:flex space-x-4 flex-1 justify-center">
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
        <div class="md:hidden flex-1 flex justify-end">
          <button 
            class="text-gray-700 hover:text-blue-600 transition-colors duration-200 border-none bg-transparent shadow-none outline-none" 
            @click="toggleMobileMenu"
            aria-label="菜单"
          >
            <!-- Material Design Hamburger Icon -->
            <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="6" width="16" height="2" rx="1" fill="currentColor"/>
              <rect x="4" y="11" width="16" height="2" rx="1" fill="currentColor"/>
              <rect x="4" y="16" width="16" height="2" rx="1" fill="currentColor"/>
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
<style scoped>
@media (max-width: 640px) {
  .clamp-title {
    font-size: clamp(14px, 6vw, 28px);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>