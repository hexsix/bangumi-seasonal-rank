<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-4 text-center">
    <h1 v-if="error.statusCode === 404" class="text-6xl font-bold text-gray-800 mb-4">404</h1>
    <h1 v-else class="text-6xl font-bold text-gray-800 mb-4">{{ error.statusCode }}</h1>
    
    <p v-if="error.statusCode === 404" class="text-2xl text-gray-600 mb-8">页面未找到</p>
    <p v-else class="text-2xl text-gray-600 mb-8">发生错误</p>
    
    <nuxt-link to="/" class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
      返回首页
    </nuxt-link>
  </div>
</template>

<script>
export default {
  props: ['error'],
  layout: 'empty'
}
</script> 