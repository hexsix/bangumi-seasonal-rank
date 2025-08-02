<template>
  <header class="bg-white dark:bg-[#343536] shadow-sm transition-colors duration-300">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center min-h-16">
        <!-- Logo -->
        <div class="flex-1 md:flex-none flex items-center">
          <NuxtLink to="/" class="text-xl font-bold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors no-underline md:text-left text-center md:w-auto w-full clamp-title">
            {{ pageTitle }}
          </NuxtLink>
        </div>

        <!-- 右侧可点击区域 (桌面) -->
        <div class="hidden md:flex flex-1 justify-end items-center space-x-4">
          <nav class="flex items-center space-x-4">
          <NuxtLink
            v-for="season in recentSeasons"
            :key="season.season_id"
            :to="`/${season.season_id}`"
            class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors no-underline"
            active-class="text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/50"
          >
            {{ formatSeasonNameShort(season.season_id) }}
          </NuxtLink>
          <NuxtLink
            to="/list"
            class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors no-underline"
            active-class="text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/50"
          >
            更多
          </NuxtLink>
        </nav>

          <button @click="colorMode.toggleDark()" class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 border-none bg-transparent shadow-none outline-none w-10 h-10 flex items-center justify-center rounded-full" aria-label="切换暗色模式">
            <ClientOnly>
              <svg v-if="colorMode.isDark.value" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg>
              <svg v-else class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 5.05a1 1 0 010 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 0zM3 11a1 1 0 100-2H2a1 1 0 100 2h1z"></path></svg>
            </ClientOnly>
          </button>
        </div>

        <!-- 移动端菜单按钮 -->
        <div class="md:hidden flex-1 flex justify-end">
          <button 
            class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 border-none bg-transparent shadow-none outline-none" 
            @click="toggleMobileMenu"
            aria-label="菜单"
          >
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
            class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 block px-3 py-2 rounded-md text-base font-medium no-underline"
            active-class="text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/50"
            @click="mobileMenuOpen = false"
          >
            {{ formatSeasonNameShort(season.season_id) }}
          </NuxtLink>
          <NuxtLink
            to="/list"
            class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 block px-3 py-2 rounded-md text-base font-medium no-underline"
            active-class="text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/50"
            @click="mobileMenuOpen = false"
          >
            更多季度
          </NuxtLink>
           <div class="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
             <NuxtLink
               :to="route.fullPath"
               @click.prevent="colorMode.toggleDark(); mobileMenuOpen = false"
               class="w-full flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 block px-3 py-2 rounded-md text-base font-medium no-underline"
               active-class="bg-transparent"
               exact-active-class="bg-transparent"
             >
                <span>切换主题</span>
                <svg v-if="colorMode.isDark.value" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg>
                <svg v-else class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 5.05a1 1 0 010 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 0zM3 11a1 1 0 100-2H2a1 1 0 100 2h1z"></path></svg>
             </NuxtLink>
           </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { formatSeasonName } from '~/utils/helpers'

const mobileMenuOpen = ref(false)
const route = useRoute()
const { seasons } = useSeasons()
const { $colorMode } = useNuxtApp()
const colorMode = $colorMode as { isDark: Ref<boolean>, toggleDark: () => void }


const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const pageTitle = computed(() => {
  if (route.name === 'season_id' && route.params.season_id) {
    const seasonName = formatSeasonName(String(route.params.season_id))
    return `Bangumi ${seasonName}新番排行`
  }
  return 'Bangumi 新番排行榜'
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
    padding-top: 0.1em;
    padding-bottom: 0.1em;
  }
}
</style>
