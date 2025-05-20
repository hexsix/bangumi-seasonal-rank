<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-4 text-center">
    <h1 class="text-6xl font-bold text-gray-800 mb-4">404</h1>
    <p class="text-2xl text-gray-600 mb-8">页面未找到</p>
    <nuxt-link to="/" class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
      返回首页
    </nuxt-link>
  </div>
</template>

<script>
export default {
  name: 'NotFoundPage'
}
</script> 