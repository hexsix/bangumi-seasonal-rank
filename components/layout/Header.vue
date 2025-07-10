<template>
  <header class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <div class="flex items-center">
          <NuxtLink to="/" class="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
            Bangumi.tv 动画季度排行榜
          </NuxtLink>
        </div>

        <!-- 导航菜单 -->
        <nav class="flex space-x-8">
          <NuxtLink
to="/"
            class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            active-class="text-blue-600 bg-blue-50">
            当季排行
          </NuxtLink>
          <NuxtLink
to="/list"
            class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            active-class="text-blue-600 bg-blue-50">
            季度列表
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
to="/" class="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
            active-class="text-blue-600 bg-blue-50" @click="mobileMenuOpen = false">
            当季排行
          </NuxtLink>
          <NuxtLink
to="/list"
            class="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
            active-class="text-blue-600 bg-blue-50" @click="mobileMenuOpen = false">
            季度列表
          </NuxtLink>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const mobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}
</script>