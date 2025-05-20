<template>
  <div class="container mx-auto p-4 max-w-screen-lg text-center">
    <h1 class="text-3xl font-bold mb-6">404 - 页面未找到</h1>
    <p class="mb-4">抱歉，您访问的页面不存在。</p>
    <NuxtLink to="/" class="text-blue-500 hover:underline">返回首页</NuxtLink>
  </div>
</template>

<script>
export default {
  name: 'Error404'
}
</script> 